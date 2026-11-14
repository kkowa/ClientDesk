export enum WorkRequestStatus {
  Open = "open",
  AwaitingApproval = "awaiting_approval",
  Declined = "declined",
  ChangeRequested = "change_requested",
  Approved = "approved",
  InProgress = "in_progress",
  Completed = "completed"
}
export const statusGroups = {
  current: [
    WorkRequestStatus.Open,
    WorkRequestStatus.AwaitingApproval,
    WorkRequestStatus.ChangeRequested,
    WorkRequestStatus.Approved,
    WorkRequestStatus.InProgress,
  ],
  past: [
    WorkRequestStatus.Completed,
    WorkRequestStatus.Declined,
  ],
} as const;

export type RequestGroup = keyof typeof statusGroups;

export type WorkRequest = {
  developerId: string;
  clientId: string;
  title: string;
  description: string;
  status: WorkRequestStatus;
  submittedAt: Date;
  updatedAt: Date;
};

export type Proposal = {
  currentRevisionId: string;
  acceptedRevisionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProposalRevision = {
  revisionNumber: number;
  description: string;
  authorId: string;
  createdAt: Date;
  submittedAt: Date | null;
};

export type ChangeRequest = {
  description: string;
  authorId: string;
  createdAt: Date;
};
