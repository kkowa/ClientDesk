import { redirect } from "next/navigation";
import { getServerUser } from "@/src/lib/auth/auth-server";
import { Role } from "@/src/types/role";
import { EmptyState } from "@/src/components/ui/empty-state";
import WorkRequestButton from "@/src/app/client/components/work-request-button";
import { adminDb } from "@/src/lib/firebase/admin";
import { WorkRequest } from "@/src/types/work-request";

export default async function Page() {
  const serverUser = await getServerUser();

  // kick to login if not authenticated
  if (!serverUser) {
    redirect("/auth/login");
  }

  // kick to login if role is not client
  if (serverUser.role !== Role.Client) {
    redirect("/auth/login");
  }

  const clientRef = adminDb.collection("clients").doc(serverUser.uid);

  const requestsSnapshot = await adminDb
    .collection("workRequests")
    .where("clientId", "==", clientRef.id)
    .get();

  const requests: (WorkRequest & { id: string })[] = requestsSnapshot.docs.map(
    (doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...(data as WorkRequest),
        submittedAt: data.submittedAt.toDate(),
      };
    },
  );

  // Get the developer name, if available
  const developerRef = adminDb
    .collection("developers")
    .doc(requests[0]?.developerId)
    .get();

  const developerSnapshot = await developerRef;
  const developer = developerSnapshot.data();
  const developerName = developer?.name ?? "N/A";

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-8">
      <h1 className="text-2xl font-bold">Client Dashboard</h1>
      <div>Welcome, {serverUser.email}</div>

      <WorkRequestButton />

      {requests.length === 0 ? (
        <EmptyState
          title="No requests yet"
          message="Requests you submit will appear here."
        />
      ) : (
        <div className="mt-10 w-full max-w-4xl">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold mb-4">Your Work Requests</h1>
            <p className="text-lg">Developer: <span className="font-bold">{developerName}</span></p>
          </div>
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-black border-white border-2 p-4 rounded-lg mb-4 text-white flex justify-between items-start text-left"
            >
              <div className="flex flex-col">
                <h2 className="text-xl font-bold">{request.title}</h2>
                <p className="mt-2 text-blue-300">{request.description}</p>
                <p className="mt-2">
                  Status:{" "}
                  <span className="text-green-300">{request.status}</span>
                </p>
              </div>
              <div>
                <p>
                  Submitted at:{" "}
                  {request.submittedAt.toLocaleDateString("en-us", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
