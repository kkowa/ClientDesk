import Link from "next/link";
import { LinkButton } from "@/src/components/ui/button";

// Define the shape of expected query parameters
type SearchParams = Promise<{ reason?: string }>;

export default async function Page(props: { searchParams: SearchParams }) {
  const registrationErrors: Record<string, string> = {
    invalid_name: "Please enter your name",
    invalid_email: "Please enter a valid email address",
    email_already_registered: "The email you provided is already registered",
    invalid_password: "Please enter a valid password",
    invalid_input: "Please check your information and try again",
  };

  // Await the searchParams promise to extract values
  const searchParams = await props.searchParams;

  // Safely extract a specific query param (e.g., ?reason=email_already_registered)
  const reason = searchParams.reason;

  const errorMessage =
    registrationErrors[reason ?? ""] ?? registrationErrors.invalid_input;

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <h1 className="text-2xl font-bold text-error">
        Developer Registration Error
      </h1>

      <div className="text-error text-center">{errorMessage}</div>

      <div className="mt-4">
        <Link href="/developer/registration">
          <LinkButton>Developer Registration</LinkButton>
        </Link>
      </div>
      <div className="mt-4">Please contact support if the issue persists.</div>
    </div>
  );
}
