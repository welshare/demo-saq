"use client";

/**
 * Privy Provider Setup (for Method #2: Embedded Wallet)
 * 
 * Configures Privy for email/Google authentication and embedded wallet creation.
 * Only needed if using the embedded wallet submission method.
 */

import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";

export const privyConfig: PrivyClientConfig = {
  loginMethods: ["email", "google"],
  embeddedWallets: {
    ethereum: {
      createOnLogin: "users-without-wallets",
    },
  },
  appearance: {},
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={privyConfig}
    >
      {children}
    </PrivyProvider>
  );
}
