import { ClientRegistrationForm } from "@/src/app/client/_components/client-registration-form";
import { EmptyState } from "@/src/components/ui/empty-state";
import { getClientInvitation } from "@/src/lib/data/get-client-invitation";

type PageProps = {
  searchParams: Promise<{ uid?: string | string[]; token?: string | string[] }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { uid, token } = await searchParams;
  const invitation =
    typeof uid === "string" && typeof token === "string"
      ? await getClientInvitation(uid, token)
      : null;

  if (!invitation) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6 py-10">
        <section className="w-full max-w-md rounded-xl border-2 border-foreground p-6">
          <EmptyState
            title="Registration Link Unavailable"
            message="This link is invalid, expired, or already used. Please contact your developer for a new invitation."
          />
        </section>
      </main>
    );
  }

  return <ClientRegistrationForm {...invitation} />;
}
