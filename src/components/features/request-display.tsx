import Link from "next/link";
import { Role } from "@/src/types/role";
import { Client } from "@/src/types/client";
import { Card } from "@/src/components/ui/card";
import { requestStatusLabel } from "@/src/lib/data/request-status-label";
import { WorkRequest } from "@/src/types/work-request";


interface RequestDisplayProps {
  role: Role;
  request: WorkRequest & { id: string };
  client?: Client | null;
}

export default function RequestDisplay({ role, request, client }: RequestDisplayProps) {
  let dashboardLink;
  switch (role) {
    case Role.Client:
      dashboardLink = "/client/dashboard";
      break;
    case Role.Developer:
      dashboardLink = "/developer/dashboard";
      break;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <Link
        href={dashboardLink}
        className="w-fit text-sm hover:text-primary"
      >
        ← Back to dashboard
      </Link>
      <h1 className="text-2xl font-bold">{request.title}</h1>
      <Card>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[auto_1fr]">
          { role === Role.Developer && (
            <>
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
            </>
          )}
          <dt className="text-sm text-muted">Status</dt>
          <dd>{requestStatusLabel(request.status)}</dd>
          <dt className="text-sm text-muted">Submitted</dt>
          <dd>{request.submittedAt.toLocaleDateString()}</dd>
        </dl>
      </Card>
      <section aria-label="Request description" className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">Description</h2>
        <Card>
          <p className="whitespace-pre-wrap wrap-break-word">
            {request.description}
          </p>
        </Card>
      </section>
    </div>
  );
}
