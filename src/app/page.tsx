import { Button } from "@/src/components/ui/button";

export default async function Home() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-dvh">
      <h1 className="text-2xl font-bold">Welcome to Client Desk</h1>
      <div className="text-lg italic">
        Where developers can manage their client requests efficiently.
      </div>
      <div className="mt-4">
        <Button href="/developer/registration">Developer Registration</Button>
      </div>
      <div>or</div>
      <div>
        <Button href="/auth/login">Login</Button>
      </div>
    </div>
  );
}
