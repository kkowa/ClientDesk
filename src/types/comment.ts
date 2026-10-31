import { Role } from "./role";

export type Comment = {
  workRequestId: string;
  authorId: string;
  authorRole: Role;
  text: string;
  createdAt: Date;
}

// the author's name and the document ID aren't stored on the comment itself
export type CommentWithAuthor = Comment & {
  id: string;
  authorName: string;
};
