import { Card } from "@/src/components/ui/card";
import { getCurrentDecline } from "@/src/lib/data/get-current-decline";
import { Role } from "@/src/types/role";

interface DeclineDisplayProps {
  requestId: string;
  role: Role;
}

export async function DeclineDisplay({
  requestId,
  role
}: DeclineDisplayProps) {
  const result = await getCurrentDecline(requestId, role);
  if (!result.ok) {
    return null;
  }

  const { description, submittedAt } = result.data;

  return (
    <section
      aria-label="Decline description"
      className="flex flex-col gap-2 w-full"
    >
      <h2 className="text-xl font-bold">Work Declined</h2>
      <Card>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[auto_1fr]">
          <dt className="text-sm text-muted">Reason</dt>
          <dd>{description}</dd>
          {submittedAt && (
            <>
              <dt className="text-sm text-muted">Submitted</dt>
              <dd>{submittedAt.toLocaleDateString()}</dd>
            </>
          )}
        </dl>
      </Card>
    </section>
  );
}
