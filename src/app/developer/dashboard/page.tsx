import { redirect } from "next/navigation";
import { getServerUser } from "@/src/lib/auth/auth-server";
import { Role } from "@/src/types/role";
import { SignOutButton } from "@/src/components/auth/sign-out-button";


export default async function Page() {

  const serverUser = await getServerUser();

  // kick to login if not authenticated
  if (!serverUser) {
    redirect('/auth/login');
  }

  // kick to login if role is not developer
  if (serverUser.role !== Role.Developer) {
    redirect('/auth/login');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <h1 className="text-2xl font-bold">
        Developer Dashboard
      </h1>
      <div>
        Welcome, {serverUser.email}
      </div>
      <div className="mt-4">
        <SignOutButton />
      </div>
    </div>
  );
}
