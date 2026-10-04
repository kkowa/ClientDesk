import AuthForm from "@/src/components/auth-form";
import { getServerUser } from "@/src/lib/auth/auth-server";


export default async function Page() {
  const serverUser = await getServerUser();

  return (
    <div className="flex flex-col gap-4 m-4">
      <h1>Login Page</h1>
      <AuthForm serverUser={serverUser} />
    </div>
  );
}
