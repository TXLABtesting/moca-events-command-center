import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import AppClient from './AppClient';

// The dashboard is a stateful client application (bilingual, RTL-aware) ported
// from the approved design. The server side gates it behind SSO and serves the
// user's scoped data through /api/bootstrap and /api/state.
export default async function Home() {
  const session = await auth();
  if (!session?.user?.email) redirect('/signin');
  return <AppClient />;
}
