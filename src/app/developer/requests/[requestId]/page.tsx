import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/src/components/ui/card";
import { ErrorMessage } from "@/src/components/ui/error-message";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { getRequestDetails } from "@/src/lib/data/get-request-details";
import { getClientForDeveloper } from "@/src/lib/data/get-client-for-developer";
import { requestStatusLabel } from "@/src/lib/data/request-status-label";

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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <Link
        href="/developer/dashboard"
        className="w-fit text-sm hover:text-primary"
      >
        ← Back to dashboard
      </Link>
      <h1 className="text-2xl font-bold">{request.title}</h1>
      <Card>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[auto_1fr]">
          <dt className="text-sm text-muted">Client</dt>
          <dd>
            {client ? (
              <Link
                href={`/developer/clients/${client.authUserId}`}
                className="hover:text-primary"
              >
                {client.name}
              </Link>
            ) : (
              "Unknown client"
            )}
          </dd>
          <dt className="text-sm text-muted">Status</dt>
          <dd>{requestStatusLabel(request.status)}</dd>
          <dt className="text-sm text-muted">Submitted</dt>
          <dd>{request.submittedAt.toLocaleDateString()}</dd>
        </dl>
      </Card>
      <section aria-label="Request description" className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">Description</h2>
        <Card>
          <p className="whitespace-pre-wrap break-words">
            {request.description}
          </p>
        </Card>
      </section>
    </div>
  );
}
