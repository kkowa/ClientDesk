import Link from "next/link";
import { LinkButton } from "@/src/components/ui/button";

export default function DeveloperRegistrationErrorPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-error">
        Developer Registration Error
      </h1>
      <div>
        There was an error creating your developer account. Please try again.
      </div>
      <div className="mt-4">
        <Link href="/developer-registration">
          <LinkButton>
            Developer Registration
          </LinkButton>
        </Link>
        Please contact support if the issue persists.
      </div>
    </div>
  );
}
