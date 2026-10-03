import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth-server';
import { adminDb } from "@/lib/firebase-admin";

// Opt out of static caching if you want your Firestore data to load fresh on every request
export const dynamic = "force-dynamic";

interface Developer {
  authUserId: string;
  name: string;
  email: string;
  createdAt: Date;
}

export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');

  const snapshot = await adminDb.collection("developers").get();
  const developers: Developer[] = snapshot.docs.map((doc) => ({
    authUserId: doc.data().authUserId,
    name: doc.data().name,
    email: doc.data().email,
    createdAt: doc.data().createdAt.toDate(),
  })) as Developer[];


  return (
    <>
      <div>
        Welcome, {user.email}
      </div>

      <div>
        <h2>Developers</h2>
        <ul>
          {developers.map((developer) => (
            <li key={developer.authUserId}>
              {developer.name} ({developer.email})
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
