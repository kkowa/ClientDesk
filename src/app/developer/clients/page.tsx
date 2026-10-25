import Link from "next/link";
import { redirect } from "next/navigation";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { Card } from "@/src/components/ui/card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { getClientsForDeveloper } from "@/src/lib/data/get-clients-for-developer";

export default async function Page() {
  const developerResult = await requireDeveloperId();
  if (!developerResult.ok) {
    redirect("/auth/login");
  }

  const developerId = developerResult.data;
  const clients = await getClientsForDeveloper(developerId);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold">Clients</h1>
      {clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          message="Clients you create will appear here."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {clients.map((client) => (
            <li key={client.authUserId}>
              <Link
                href={`/developer/clients/${client.authUserId}`}
                className="block rounded-xl hover:ring-2 hover:ring-primary"
              >
                <Card>
                  <p className="font-medium">{client.name}</p>
                  <p className="break-all text-sm text-muted">{client.email}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
