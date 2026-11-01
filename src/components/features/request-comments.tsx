import { getCommentsForRequest } from "@/src/lib/data/get-comments-for-request";
import { CommentForm } from "@/src/components/features/comment-form";
import { Card } from "@/src/components/ui/card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { ErrorMessage } from "@/src/components/ui/error-message";
import { CldImage } from "next-cloudinary";

interface RequestCommentsProps {
  workRequestId: string;
}

export async function RequestComments({ workRequestId }: RequestCommentsProps) {
  const result = await getCommentsForRequest(workRequestId);

  return (
    <section aria-label="Comments" className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">Comments</h2>
      {!result.ok ? (
        <ErrorMessage message="We couldn't load the comments. Please refresh the page." />
      ) : result.data.length === 0 ? (
        <EmptyState
          title="No comments yet"
          message="Comments on this request will appear here."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {result.data.map((comment) => (
            <li key={comment.id}>
              <Card>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <p className="font-medium">{comment.authorName}</p>
                    <p className="text-sm text-muted">
                      {comment.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <p className="whitespace-pre-wrap wrap-break-word">{comment.text}</p>
                  {comment.image && (
                    <a
                      href={comment.image.secureUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-fit"
                    >
                      <CldImage
                        src={comment.image.publicId}
                        alt="Image attached to comment"
                        width={800}
                        height={600}
                        sizes="(max-width: 768px) 100vw, 768px"
                        config={{
                          cloud: {
                            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
                          },
                        }}
                        className="h-auto max-h-96 w-auto max-w-full rounded-lg"
                      />
                    </a>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <CommentForm workRequestId={workRequestId} />
    </section>
  );
}
