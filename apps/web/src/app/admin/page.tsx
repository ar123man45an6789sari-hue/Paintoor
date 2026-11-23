/* Admin panel — hidden route (no header link). The passcode gate unlocks
   once per browser tab (sessionStorage); after that the full workspace
   renders on demo data. Real server-side admin auth arrives in Phase 2.7. */
"use client";

import { useCallback, useState } from "react";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminWorkspace } from "@/components/admin/AdminWorkspace";

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);

  /* Lock = forget this tab's unlock and hand the room back to the gate. */
  const lock = useCallback(() => {
    try {
      window.sessionStorage.removeItem("gs_admin_unlocked");
    } catch {
      /* private mode */
    }
    setUnlocked(false);
  }, []);

  return unlocked ? <AdminWorkspace onLock={lock} /> : <AdminGate onUnlock={() => setUnlocked(true)} />;
}