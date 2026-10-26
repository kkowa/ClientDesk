import { redirect } from "next/navigation";
import { getServerUser } from "@/src/lib/auth/auth-server";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { getRequestsForDeveloper } from "@/src/lib/data/get-developer-work-requests";
import { getClientsForDeveloper } from "@/src/lib/data/get-clients-for-developer";
import { RequestCard } from "@/src/components/features/request-card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { ErrorMessage } from "@/src/components/ui/error-message";
import type { ActionResult } from "@/src/types/action-result";
import type { WorkRequest } from "@/src/types/work-request";

type RequestWithId = WorkRequest & { id: string };

export default async function Page() {
  let serverUser;
  try {
    serverUser = await getServerUser();
  } catch (error) {
    console.error("Failed to get server user:", error);
    redirect("/auth/login");
  }

  // also checks the user is a logged-in developer
  const developerResult = await requireDeveloperId(serverUser);
  if (!serverUser || !developerResult.ok) {
    redirect("/auth/login");
  }
  const developerId = developerResult.data;

  const [currentResult, pastResult, clients] = await Promise.all([
    getRequestsForDeveloper(developerId, "current"),
    getRequestsForDeveloper(developerId, "past"),
    getClientsForDeveloper(developerId),
  ]);

  // requests only store the clientId, so look names up from the developer's clients
  const clientNames = new Map(
    clients.map((client) => [client.authUserId, client.name]),
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Developer Dashboard</h1>
        <p className="text-muted">Welcome, {serverUser.email}</p>
      </div>
      <RequestRow
        title="Current Requests"
        result={currentResult}
        clientNames={clientNames}
        emptyTitle="No current requests"
        emptyMessage="New requests from your clients will appear here."
      />
      <RequestRow
        title="Past Requests"
        result={pastResult}
        clientNames={clientNames}
        emptyTitle="No past requests"
        emptyMessage="Completed and declined requests will appear here."
      />
    </div>
  );
}

interface RequestRowProps {
  title: string;
  result: ActionResult<RequestWithId[]>;
  clientNames: Map<string, string>;
  emptyTitle: string;
  emptyMessage: string;
}

// a sideways-scrolling row of request cards (the dashboard "carousel")
function RequestRow({
  title,
  result,
  clientNames,
  emptyTitle,
  emptyMessage,
}: RequestRowProps) {
  const requests = result.ok
    ? [...result.data].sort(
        (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime(),
      )
    : [];

  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">{title}</h2>
      {!result.ok ? (
        <ErrorMessage message="We couldn't load these requests. Please refresh the page." />
      ) : requests.length === 0 ? (
        <EmptyState title={emptyTitle} message={emptyMessage} />
      ) : (
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
          {requests.map((request) => (
            <li key={request.id} className="w-64 shrink-0 snap-start">
              <RequestCard
                request={request}
                clientName={clientNames.get(request.clientId)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
