import Link from "next/link";
import { SignOutButton } from "@/src/components/auth/sign-out-button";
import Image from "next/image";

export function ClientNavbar() {
  return (
    <header className="border-b border-border bg-surface">
      <nav
        aria-label="Client"
        className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <Link href="/client/dashboard" aria-label="ClientDesk">
          <picture>
            <source
              srcSet="/darklogo.png"
              media="(prefers-color-scheme: dark)"
            />
            <Image
              src="/lightlogo.png"
              alt="ClientDesk"
              width={160}
              height={48}
              className="h-12 w-auto"
            />
          </picture>
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/client/dashboard" className="hover:text-primary">
            Dashboard
          </Link>
          <SignOutButton />
        </div>
      </nav>
    </header>
  );
}
