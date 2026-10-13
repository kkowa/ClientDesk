import { redirect } from "next/navigation";
import { getServerUser } from "@/src/lib/auth/auth-server";
import { Role } from "@/src/types/role";
import { EmptyState } from "@/src/components/ui/empty-state";


export default async function Page() {

  const serverUser = await getServerUser();

  // kick to login if not authenticated
  if (!serverUser) {
    redirect('/auth/login');
  }

  // kick to login if role is not client
  if (serverUser.role !== Role.Client) {
    redirect('/auth/login');
  }

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-8">
      <h1 className="text-2xl font-bold">
        Client Dashboard
      </h1>
      <div>
        Welcome, {serverUser.email}
      </div>
      <EmptyState
        title="No requests yet"
        message="Requests you submit will appear here."
      />
    </div>
  );
}
