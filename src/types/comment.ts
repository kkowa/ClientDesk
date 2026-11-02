import { Role } from "./role";

export type CommentImage = {
  publicId: string;
  secureUrl: string;
};

export type Comment = {
  workRequestId: string;
  authorId: string;
  authorRole: Role;
  text: string;
  image?: CommentImage;
  createdAt: Date;
}

// the author's name and the document ID aren't stored on the comment itself
export type CommentWithAuthor = Comment & {
  id: string;
  authorName: string;
};
