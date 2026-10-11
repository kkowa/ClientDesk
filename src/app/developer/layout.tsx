import { getServerUser } from "@/src/lib/auth/auth-server";
import { Role } from "@/src/types/role";
import { DeveloperNavbar } from "@/src/app/developer/components/navbar";


export default async function DeveloperLayout({ children }: LayoutProps<"/developer">) {
  const serverUser = await getServerUser();

  // public pages (e.g. registration) share this layout, so only show the navbar to developers
  const isDeveloper = serverUser?.role === Role.Developer;

  return (
    <>
      {isDeveloper && <DeveloperNavbar />}
      {children}
    </>
  );
}
