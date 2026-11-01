import {z} from "zod";

// shared by the comment form and the server-side upload check
export const MAX_IMAGE_SIZE_MB = 5;

// text is optional because a comment can be just an image; addComment rejects a comment with neither
export const CommentSchema = z.object({
    text: z.string().trim(),
})
