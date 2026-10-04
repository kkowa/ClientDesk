import AuthForm from "@/src/components/auth-form";
import { getServerUser } from "@/src/lib/auth/auth-server";


export default async function Home() {
  const serverUser = await getServerUser();

  return (
    <div className="flex flex-col gap-4 m-4">
      <h1>Welcome to the Home Page</h1>
      <AuthForm serverUser={serverUser} />
    </div>
  );
}
