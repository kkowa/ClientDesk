import { redirect } from "next/navigation";
import { getServerUser } from "@/src/lib/auth/auth-server";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { getRequestsForDeveloper } from "@/src/lib/data/get-developer-work-requests";
import { getClientsForDeveloper } from "@/src/lib/data/get-clients-for-developer";
import {
  sortCurrentRequests,
  sortPastRequests,
} from "@/src/lib/data/sort-work-requests";
import { RequestRow } from "@/src/app/developer/components/request-row";
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
  const clientNames = Object.fromEntries(
    clients.map((client) => [client.authUserId, client.name]),
  );
  const sortBySubmittedAt = (requests: RequestWithId[]) =>
    [...requests].sort(
      (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime(),
    );
  const currentRequests = currentResult.ok
    ? sortCurrentRequests(sortBySubmittedAt(currentResult.data))
    : null;
  const pastRequests = pastResult.ok
    ? sortPastRequests(sortBySubmittedAt(pastResult.data))
    : null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Developer Dashboard</h1>
        <p className="text-muted">Welcome, {serverUser.email}</p>
      </div>
      <RequestRow
        title="Current Requests"
        group="current"
        requests={currentRequests}
        clientNames={clientNames}
        emptyTitle="No current requests"
        emptyMessage="New requests from your clients will appear here."
      />
      <RequestRow
        title="Past Requests"
        group="past"
        requests={pastRequests}
        clientNames={clientNames}
        emptyTitle="No past requests"
        emptyMessage="Completed and declined requests will appear here."
      />
    </div>
  );
}
