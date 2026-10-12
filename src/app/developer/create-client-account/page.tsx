import { redirect } from "next/navigation";
import { getServerUser } from "@/src/lib/auth/auth-server";
import { Role } from "@/src/types/role";
import { ClientAccountForm } from "@/src/app/developer/components/client-account-form";

export default async function Page() {
  const serverUser = await getServerUser();
  if (!serverUser || serverUser.role !== Role.Developer) {
    redirect("/auth/login");
  }

  return <ClientAccountForm />;
}
