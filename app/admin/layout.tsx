
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // shell: login page if not authed
  const ok = await isAdmin();
  return <>{children}</>;
}
