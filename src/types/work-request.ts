export enum WorkRequestStatus {
  Open = "open",
  AwaitingApproval = "awaiting_approval",
  Declined = "declined",
  ChangeRequested = "change_requested",
  Approved = "approved"
}

export type WorkRequest = {
  developerId: string;
  clientId: string;
  title: string;
  description: string;
  status: WorkRequestStatus.Open;
  submittedAt: Date;
  updatedAt: Date;
};