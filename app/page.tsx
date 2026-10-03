'use client'

import { signIn } from '@/lib/sign-in-up-out';
import { redirect } from 'next/navigation';

export default function Home() {

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    await signIn(email, password);
    redirect('/dashboard');
  }

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <form onSubmit={handleSignIn}>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required />
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" required />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}
