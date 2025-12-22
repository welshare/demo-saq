"use client";

import { useLogin, usePrivy } from "@privy-io/react-auth";

function LoginButton() {
  const { ready, authenticated  } = usePrivy();
  const { login } = useLogin();
  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);

  return (
    <button disabled={disableLogin} onClick={login} className="form-button">
      Log in
    </button>
  );
}

export default function LoginComponent() {
  const { ready, authenticated, user } = usePrivy();

  if (!ready) return <div>Loading Privy...</div>;

  if (user) return <div>Logged in as {user.wallet?.address}</div>;
  if (authenticated) return <div>Logged in</div>;

  return (
    <div>
      <LoginButton />
    </div>
  );
}
