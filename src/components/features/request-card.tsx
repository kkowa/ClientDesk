import Link from "next/link";
import { Card } from "@/src/components/ui/card";
import { requestStatusLabel } from "@/src/lib/data/request-status-label";
import type { WorkRequest } from "@/src/types/work-request";

interface RequestCardProps {
  request: WorkRequest & { id: string };
  // omit when the client is already clear from the page (e.g. client details)
  clientName?: string;
}

export function RequestCard({ request, clientName }: RequestCardProps) {
  return (
    <Link
      href={`/developer/requests/${request.id}`}
      className="block h-full rounded-xl outline-none hover:ring-2 hover:ring-primary focus-visible:ring-2 focus-visible:ring-primary"
    >
      <Card>
        <div className="flex flex-col gap-1">
          <p className="font-medium">{request.title}</p>
          {clientName && <p className="text-sm text-muted">{clientName}</p>}
          <p className="text-sm">{requestStatusLabel(request.status)}</p>
          <p className="text-sm text-muted">
            Submitted {request.submittedAt.toLocaleDateString()}
          </p>
        </div>
      </Card>
    </Link>
  );
}
