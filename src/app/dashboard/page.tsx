import { redirect } from "next/navigation";
import { getServerUser } from "@/src/lib/auth/auth-server";
import type { Developer } from "@/src/types/developer";
import { getDevelopers } from "@/src/lib/data/get-developers";


export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');

  const developers: Developer[] = await getDevelopers();

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
