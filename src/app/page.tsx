import AppClient from './AppClient';

// The dashboard is a rich, stateful client SPA (bilingual, RTL-aware,
// localStorage-persisted) ported verbatim from the approved design, so it is
// rendered entirely on the client. Server concerns (auth gating, data
// provider, API routes) live around it — see src/auth.ts and src/lib.
export default function Home() {
  return <AppClient />;
}
