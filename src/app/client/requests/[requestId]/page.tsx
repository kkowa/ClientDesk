import { notFound, redirect } from "next/navigation";
import { requireClientId } from "@/src/lib/access-checks/require-client-id";
import { getRequestDetails } from "@/src/lib/data/get-request-details";
import { Role } from "@/src/types/role";
import RequestDisplay from "@/src/components/features/request-display";
import { ErrorMessage } from "@/src/components/ui/error-message";


export default async function Page({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;

  let clientId;
  try {
    const result = await requireClientId();
    if (!result.ok) {
      redirect("/auth/login");
    }
    clientId = result.data;
  } catch {
    console.error("Client requests: Failed to get client ID");
    redirect("/auth/login");
  }

  let error = null;
  let requestResult = null;
  try {
    requestResult = await getRequestDetails(requestId);
    if (!requestResult.ok) {
      error = "Failed to load request";
    }
  } catch {
    error = "Failed to load request";
  }

  if (error || !requestResult) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <ErrorMessage message="We couldn't load this request. Please refresh the page." />
      </div>
    );
  }

  let request = null;
  if (requestResult.ok) request = requestResult.data;
  if (!request) {
    notFound();
  }

  if (request.clientId !== clientId) {
    notFound();
  }

  return <RequestDisplay role={Role.Client} request={request} />;
}
