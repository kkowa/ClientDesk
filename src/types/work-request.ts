export enum WorkRequestStatus {
  Open = "open",
  AwaitingApproval = "awaiting_approval",
  Declined = "declined",
  ChangeRequested = "change_requested",
  Approved = "approved",
  InProgress = "in_progress",
  Completed = "completed"
}

export type WorkRequest = {
  developerId: string;
  clientId: string;
  title: string;
  description: string;
  status: WorkRequestStatus;
  submittedAt: Date;
  updatedAt: Date;
};
