import { Card } from "@/src/components/ui/card";
import { getCurrentProposal } from "@/src/lib/actions/get-current-proposal";
import { Role } from "@/src/types/role";

interface ProposalDisplayProps {
  requestId: string;
  role: Role;
}

export async function ProposalDisplay({ requestId, role }: ProposalDisplayProps) {
  const result = await getCurrentProposal(requestId, role);
  if (!result.ok) {
    return null;
  }

  const { description, submittedAt, revisionNumber } = result.data;

  return (
    <section
      aria-label="Proposal description"
      className="flex flex-col gap-2 w-full"
    >
      <h2 className="text-xl font-bold">Work Proposal</h2>
      <Card>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[auto_1fr]">
          <dt className="text-sm text-muted">Description</dt>
          <dd>{description}</dd>
          <dt className="text-sm text-muted">Revision</dt>
          <dd>{revisionNumber}</dd>
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
