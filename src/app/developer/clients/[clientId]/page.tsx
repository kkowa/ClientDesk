import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/src/components/ui/card";
import { requireDeveloperId } from "@/src/lib/access-checks/require-developer-id";
import { getClientForDeveloper } from "@/src/lib/data/get-client-for-developer";

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
    </div>
  );
}
