/* Runs a query block as the low-privilege `authenticated` role with the
   signed-in profile injected as JWT claims. RLS policies then enforce
   row visibility inside PostgreSQL itself — lock #2, independent of app
   code. Modules 2.4+ use this for every per-user read. */
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { CurrentSession } from "./session";

export async function withActor<T>(
  session: CurrentSession,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return db.$transaction(async (tx) => {
    const claims = JSON.stringify({ sub: session.profileId, role: session.role });
    await tx.$executeRaw`SELECT set_config('request.jwt.claims', ${claims}, TRUE)`;
    await tx.$executeRawUnsafe("SET LOCAL ROLE authenticated");
    return fn(tx);
  });
}