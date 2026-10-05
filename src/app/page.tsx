import { LinkButton } from "@/src/components/ui/button";
import Link from "next/link";


export default async function Home() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-dvh">
      <h1 className="text-2xl font-bold">
        Welcome to Client Desk
      </h1>
      <div className="text-lg italic">
        Where developers can manage their client requests efficiently.
      </div>
      <div className="mt-4">
        <Link href="/developer/registration">
          <LinkButton>
            Developer Registration
          </LinkButton>
        </Link>
      </div>
      <div>
        or
      </div>
      <div>
        <Link href="/auth/login">
          <LinkButton>
            Login
          </LinkButton>
        </Link>
      </div>
    </div>
  );
}
