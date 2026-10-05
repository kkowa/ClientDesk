import AuthForm from "@/src/components/auth/auth-form";
import { getServerUser } from "@/src/lib/auth/auth-server";


export default async function Page() {
  const serverUser = await getServerUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <h1 className="text-2xl font-bold mb-4">
        Login Page
      </h1>
      <AuthForm serverUser={serverUser} />
    </div>
  );
}
