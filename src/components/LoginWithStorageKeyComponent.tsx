"use client";

import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";
import { SessionKeyData } from "@welshare/sdk";

function LoginButton() {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();
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
  const { ready, user } = usePrivy();
  const { logout } = useLogout();

  if (!ready) return <div className="wallet-panel">Loading...</div>;
  if (!user) return <LoginButton />;

  return (
    <div className="wallet-panel">
      <div className="wallet-panel-header">
        <span className="wallet-panel-title">Connected Wallet</span>
        <button className="logout-button" onClick={() => logout()}>
          Logout
        </button>
      </div>

      <div className="wallet-panel-content">
        <div className="wallet-info-row">
          <span className="wallet-info-label">Address</span>
          <code className="wallet-info-value">{user.wallet?.address}</code>
        </div>

        {storageKey ? (
          <div className="wallet-info-row">
            <span className="wallet-info-label">Storage Key</span>
            <code className="wallet-info-value wallet-info-value-small">
              {storageKey.sessionKeyPair.toDidString()}
            </code>
          </div>
        ) : (
          <div className="wallet-panel-action">
            <button className="form-button" onClick={() => makeStorageKey()}>
              Derive Storage Key
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
