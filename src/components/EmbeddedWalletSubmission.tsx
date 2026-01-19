"use client";

// Method #2: Embedded Wallet Submission
// App creates an embedded wallet for the user via Privy, then uses @welshare/sdk to submit

import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";
import { SessionKeyData } from "@welshare/sdk";

function LoginButton() {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();

  return (
    <button
      disabled={!ready || authenticated}
      onClick={login}
      className="form-button"
    >
      Log in with Email/Google
    </button>
  );
}

interface EmbeddedWalletSubmissionProps {
  storageKey: SessionKeyData | undefined;
  makeStorageKey: () => Promise<void> | undefined;
}

export default function EmbeddedWalletSubmission({
  makeStorageKey,
  storageKey,
}: EmbeddedWalletSubmissionProps) {
  const { ready, user } = usePrivy();
  const { logout } = useLogout();

  if (!ready) return <div className="wallet-panel">Loading...</div>;
  if (!user) return <LoginButton />;

  return (
    <div className="wallet-panel">
      <div className="wallet-panel-header">
        <span className="wallet-panel-title">Embedded Wallet</span>
        <button className="logout-button" onClick={() => logout()}>
          Logout
        </button>
      </div>

      <div className="wallet-info-row">
        <span className="wallet-info-label">Address</span>
        <code className="wallet-info-value">{user.wallet?.address}</code>
      </div>

      {storageKey ? (
        <div className="wallet-info-row">
          <span className="wallet-info-label">Storage Key</span>
          <code className="wallet-info-value">
            {storageKey.sessionKeyPair.toDidString()}
          </code>
        </div>
      ) : (
        <button className="form-button" onClick={() => makeStorageKey()}>
          Derive Storage Key
        </button>
      )}
    </div>
  );
}
