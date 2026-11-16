import { Role } from "@/src/types/role";
import { notFound, redirect } from "next/navigation";
import { ErrorMessage } from "@/src/components/ui/error-message";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { getRequestDetails } from "@/src/lib/data/get-request-details";
import { getClientForDeveloper } from "@/src/lib/data/get-client-for-developer";
import RequestDisplay from "@/src/components/features/request-display";

export default async function Page({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;

  const developerResult = await requireDeveloperId();
  if (!developerResult.ok) {
    redirect("/auth/login");
  }
  const developerId = developerResult.data;

  const requestResult = await getRequestDetails(requestId);
  if (!requestResult.ok) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <ErrorMessage message="We couldn't load this request. Please refresh the page." />
      </div>
    );
  }

  const request = requestResult.data;
  if (!request) {
    notFound();
  }

  const client = await getClientForDeveloper(request.clientId, developerId);

  return <RequestDisplay role={Role.Developer} request={request} client={client} />;
}
