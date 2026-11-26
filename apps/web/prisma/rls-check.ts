/* Module 2.3 automated proof: plays anon / customer / partner / admin
   against the live DB and asserts PostgreSQL itself enforces visibility.
   Run: npm run db:rlscheck */
import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

const db = new PrismaClient();
let failed = 0;

function pass(name: string, ok: boolean, extra = ""): void {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
  if (!ok) failed++;
}

type Tx = Prisma.TransactionClient;

async function actorTx(claims: { sub: string; role: string } | null, fn: (tx: Tx) => Promise<void>): Promise<void> {
  await db.$transaction(async (tx) => {
    if (claims) {
      await tx.$executeRaw`SELECT set_config('request.jwt.claims', ${JSON.stringify(claims)}, TRUE)`;
    }
    await tx.$executeRawUnsafe(claims ? "SET LOCAL ROLE authenticated" : "SET LOCAL ROLE anon");
    await fn(tx);
  });
}

async function denied(claims: { sub: string; role: string } | null, fn: (tx: Tx) => Promise<unknown>): Promise<boolean> {
  try {
    await actorTx(claims, async (tx) => {
      await fn(tx);
    });
    return false;
  } catch {
    return true;
  }
}

async function main(): Promise<void> {
  const ids: Record<string, string> = {};
  for (const r of ["customer", "partner", "shopkeeper", "admin"]) {
    const rows = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Profile" WHERE role = ${r}::"Role" ORDER BY "createdAt" LIMIT 1`;
    ids[r] = rows[0]?.id ?? "";
  }
  if (!ids.customer || !ids.partner || !ids.admin) {
    throw new Error("seed profiles missing — run npm run db:seed first");
  }

  // 1. anon: catalog yes, private columns no
  await actorTx(null, async (tx) => {
    const p = await tx.$queryRaw<{ n: bigint }[]>`SELECT COUNT(*)::bigint AS n FROM "Product" WHERE listed`;
    pass("anon sees listed products", Number(p[0].n) > 0);
  });
  pass("anon cannot read Profile.phone", await denied(null, (tx) => tx.$queryRaw`SELECT phone FROM "Profile" LIMIT 1`));

  // 2. customer: self + own jobs only, no writes, no engine tables
  await actorTx({ sub: ids.customer, role: "customer" }, async (tx) => {
    const me = await tx.$queryRaw<{ n: bigint }[]>`SELECT COUNT(*)::bigint AS n FROM "Profile"`;
    pass("customer sees exactly one profile (self)", Number(me[0].n) === 1);
    const jobs = await tx.$queryRaw<{ n: bigint }[]>`SELECT COUNT(*)::bigint AS n FROM "Job"`;
    pass("customer sees own jobs", Number(jobs[0].n) >= 1);
    const audit = await tx.$queryRaw<{ n: bigint }[]>`SELECT COUNT(*)::bigint AS n FROM "AdminAuditLog"`;
    pass("customer sees zero audit rows", Number(audit[0].n) === 0);
  });
  pass("customer cannot UPDATE Job", await denied({ sub: ids.customer, role: "customer" }, (tx) => tx.$executeRaw`UPDATE "Job" SET pct = 99`));
  pass("customer cannot read AuthOtp", await denied({ sub: ids.customer, role: "customer" }, (tx) => tx.$queryRaw`SELECT * FROM "AuthOtp" LIMIT 1`));
  pass("customer cannot read Session", await denied({ sub: ids.customer, role: "customer" }, (tx) => tx.$queryRaw`SELECT * FROM "Session" LIMIT 1`));

   // 3. partner: own jobs + only orders where partner is buyer or shop owner
  const partnerOrders = await db.$queryRaw<{ n: bigint }[]>`
    SELECT COUNT(*)::bigint AS n FROM "ShopOrder"
    WHERE "buyerId" = ${ids.partner}::uuid
       OR "shopId" IN (SELECT id FROM "Shop" WHERE "ownerId" = ${ids.partner}::uuid)`;
  await actorTx({ sub: ids.partner, role: "partner" }, async (tx) => {
    const jobs = await tx.$queryRaw<{ n: bigint }[]>`SELECT COUNT(*)::bigint AS n FROM "Job"`;
    pass("partner sees own jobs", Number(jobs[0].n) >= 1);
    const orders = await tx.$queryRaw<{ n: bigint }[]>`SELECT COUNT(*)::bigint AS n FROM "ShopOrder"`;
    pass("partner sees only own-side orders", Number(orders[0].n) === Number(partnerOrders[0].n));
  });

  // 4. admin: audit visible + log_admin works; non-admin rejected
  await actorTx({ sub: ids.admin, role: "admin" }, async (tx) => {
    const before = await tx.$queryRaw<{ n: bigint }[]>`SELECT COUNT(*)::bigint AS n FROM "AdminAuditLog"`;
    await tx.$queryRaw`SELECT public.log_admin(${ids.admin}::uuid, ${"rlscheck"}, ${"automated proof"})`;
    const after = await tx.$queryRaw<{ n: bigint }[]>`SELECT COUNT(*)::bigint AS n FROM "AdminAuditLog"`;
    pass("admin log_admin appends audit row", Number(after[0].n) === Number(before[0].n) + 1);
  });
  pass("non-admin log_admin rejected", await denied({ sub: ids.customer, role: "customer" }, (tx) => tx.$queryRaw`SELECT public.log_admin(${ids.customer}::uuid, ${"hack"}, ${"x"})`));
  await db.$executeRaw`DELETE FROM "AdminAuditLog" WHERE action = 'rlscheck'`;

  console.log(failed === 0 ? "\nALL RLS CHECKS PASSED" : `\n${failed} CHECK(S) FAILED`);
  if (failed > 0) process.exitCode = 1;
}

main().finally(() => db.$disconnect());