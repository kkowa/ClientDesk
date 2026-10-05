import Link from "next/link";
import { LinkButton } from "@/src/components/ui/button";


// Define the shape of expected query parameters
type SearchParams = Promise<{ [key: string]: string | undefined }>

export default async function Page(props: { searchParams: SearchParams }) {
  // Await the searchParams promise to extract values
  const searchParams = await props.searchParams;
  
  // Safely extract a specific query param (e.g., ?reason=email_already_registered)
  const reason = searchParams.reason; 

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <h1 className="text-2xl font-bold text-error">
        Developer Registration Error
      </h1>
      <div>
        There was an error creating your developer account. Please try again.
        {reason === "email_already_registered" && (
          <div className="text-error text-center">
            The email you provided is already registered.
          </div>
        )}
      </div>
      <div className="mt-4">
        <Link href="/developer/registration">
          <LinkButton>
            Developer Registration
          </LinkButton>
        </Link>
      </div>
      <div className="mt-4">
        Please contact support if the issue persists.
      </div>
    </div>
  );
}
