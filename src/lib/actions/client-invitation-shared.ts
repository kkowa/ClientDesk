export type Invitation = {
  uid: string;
  token: string;
  clientName: string;
  clientEmail: string;
  developerName: string;
};

export function buildInvitationMessage(invitation: Invitation, origin: string) {
  const link = `${origin}/client/registration?uid=${encodeURIComponent(invitation.uid)}&token=${encodeURIComponent(invitation.token)}`;
  const message = `Hello ${invitation.clientName},\n\nPlease click the link below to register for an account. I look forward to working with you.\n\n${link}\n\nBest Regards,\n${invitation.developerName}`;

  return { link, message };
}
