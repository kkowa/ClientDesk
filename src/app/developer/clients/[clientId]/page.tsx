import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/src/components/ui/card";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { getClientForDeveloper } from "@/src/lib/data/get-client-for-developer";
import { getClientRequestsForDeveloper as getClientRequestsForDeveloper } from "@/src/lib/data/get-client-requests-for-developer";
import { RequestCard } from "@/src/components/features/request-card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { ErrorMessage } from "@/src/components/ui/error-message";

export default async function Page({
  params,
}: {
  params: { clientId: string };
}) {
  const { clientId } = await params;

  const developerResult = await requireDeveloperId();
  if (!developerResult.ok) {
    redirect("/auth/login");
  }

  // null when the client doesn't exist or belongs to another developer
  const client = await getClientForDeveloper(clientId, developerResult.data);
  if (!client) {
    notFound();
  }

  const requestsResult = await getClientRequestsForDeveloper(developerResult.data, clientId);
  const requests = requestsResult.ok
    ? [...requestsResult.data].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
    : [];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <Link
        href="/developer/clients"
        className="w-fit text-sm hover:text-primary"
      >
        ← Back to clients
      </Link>
      <h1 className="text-2xl font-bold">{client.name}</h1>
      <Card>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[auto_1fr]">
          <dt className="text-sm text-muted">Email</dt>
          <dd className="break-all">{client.email}</dd>
          <dt className="text-sm text-muted">Status</dt>
          <dd className="capitalize">{client.status}</dd>
          <dt className="text-sm text-muted">Added</dt>
          <dd>{client.createdAt.toLocaleDateString()}</dd>
        </dl>
      </Card>
      <section aria-label="Requests" className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Requests</h2>
        {!requestsResult.ok ? (
          <ErrorMessage message="We couldn't load this client's requests. Please refresh the page." />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No requests yet"
            message="Requests from this client will appear here."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {requests.map((request) => (
              <li key={request.id}>
                <RequestCard request={request} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
