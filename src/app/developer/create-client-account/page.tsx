import { redirect } from "next/navigation";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { ClientAccountForm } from "@/src/app/developer/components/client-account-form";

export default async function Page() {
  const developerResult = await requireDeveloperId();
  if (!developerResult.ok) {
    redirect("/auth/login");
  }

  return <ClientAccountForm />;
}
