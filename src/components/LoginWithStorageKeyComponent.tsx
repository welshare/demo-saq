"use client";

import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";
import { SessionKeyData } from "@welshare/sdk";

function LoginButton() {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();
  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);

  return (
    <button disabled={disableLogin} onClick={login} className="form-button">
      Log in
    </button>
  );
}

export default function LoginWithStorageKeyComponent({
  makeStorageKey,
  storageKey,
}: {
  storageKey: SessionKeyData | undefined;
  makeStorageKey: () => Promise<void> | undefined;
}) {
  const { ready, authenticated, user } = usePrivy();
  
  const { logout } = useLogout();
  if (!ready) return <div>Loading Privy...</div>;
  if (!user) return <LoginButton />;

  if (!storageKey)
    return (
      <div>
        <p>Wallet: {user.wallet?.address} (<button onClick={() => logout()}>Logout</button>)</p>
        <button className="form-button" onClick={() => makeStorageKey()}>
          Derive Storage Key
        </button>
      </div>
    );

  return (
    <div>
      <p>Wallet: {user.wallet?.address} (<button  onClick={() => logout()}>Logout</button>)</p>
      <p>Storage Key: {storageKey.sessionKeyPair.toDidString()}</p>
    </div>
  );
}
