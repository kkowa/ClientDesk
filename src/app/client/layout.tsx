import { getServerUser } from "@/src/lib/auth/auth-server";
import { Role } from "@/src/types/role";
import { ClientNavbar } from "@/src/app/client/components/navbar";


export default async function ClientLayout({ children }: LayoutProps<"/client">) {
  const serverUser = await getServerUser();

  // public pages (e.g. registration) share this layout, so only show the navbar to clients
  const isClient = serverUser?.role === Role.Client;

  return (
    <>
      {isClient && <ClientNavbar />}
      {children}
    </>
  );
}
