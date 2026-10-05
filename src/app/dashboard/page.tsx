import { redirect } from "next/navigation";
import { getServerUser } from "@/src/lib/auth/auth-server";


export default async function Page() {

  const serverUser = await getServerUser();

  if (!serverUser) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <div>
        Welcome, {serverUser.email}
      </div>
      <div>
        Your role is {serverUser.role}
      </div>
    </div>
  );
}
