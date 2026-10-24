import { redirect } from "next/navigation";
import { EmptyState } from "@/src/components/ui/empty-state";
import WorkRequestButton from "@/src/app/client/components/work-request-button";
import { requireClientId } from "@/src/lib/access-checks/require-client-id";
import { getClientWorkRequests } from "@/src/lib/data/get-client-work-requests";
import type { WorkRequest } from "@/src/types/work-request";
import { getUserContact } from "@/src/lib/data/get-user-contact";
import { Role } from "@/src/types/role";
import { UserContact } from "@/src/types/user-contact";
import WorkRequestAccordion from "@/src/app/client/components/work-request-accordion";

export default async function Page() {
  let clientId: string;
  try {
    const result = await requireClientId();
    if (result.ok) {
      clientId = result.data;
    } else {
      console.error("Client ID requirement failed:", result.error);
      redirect("/auth/login");
    }
  } catch (error) {
    console.error("Failed to require client ID:", error);
    redirect("/auth/login");
  }

  let clientContact: UserContact | null = null;
  try {
    const result = await getUserContact(clientId, Role.Client);
    if (result.ok) {
      clientContact = result.data;
    } else {
      console.error("Failed to get client contact:", result.error);
    }
  } catch (error) {
    console.error("Failed to get client contact:", error);
  }

  let workRequests: (WorkRequest & { id: string })[] = [];
  try {
    const result = await getClientWorkRequests(clientId);
    if (result.ok) {
      workRequests = result.data;
    } else {
      console.error("Failed to get client work requests:", result.error);
    }
  } catch (error) {
    console.error("Failed to get client work requests:", error);
  }

  let developerName: string | undefined = undefined;

  if (workRequests.length !== 0) {
    try {
      const result = await getUserContact(
        workRequests[0]?.developerId,
        Role.Developer,
      );
      if (result.ok) {
        const developerContact = result.data;
        developerName = developerContact.name;
      } else {
        console.error("Failed to get developer contact:", result.error);
      }
    } catch (error) {
      console.error("Failed to get developer contact:", error);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-8">
      <h1 className="text-2xl font-bold">Client Dashboard</h1>
      <div>Welcome, {clientContact?.name ?? "Client"}</div>

      <WorkRequestButton />

      {workRequests.length === 0 ? (
        <EmptyState
          title="No requests yet"
          message="Requests you submit will appear here."
        />
      ) : (
        <div className="mt-10 w-full max-w-4xl">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold mb-4">Your Work Requests</h1>
            <p className="text-lg">
              Developer: <span className="font-bold">{developerName}</span>
            </p>
          </div>
          {workRequests.map((request) => (
            <WorkRequestAccordion
              key={request.id}
              request={{
                id: request.id,
                title: request.title,
                description: request.description,
                status: request.status,
                submittedAt: request.submittedAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
