"use client";

import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import LoginComponent from "./LoginComponent";

export const privyConfig: PrivyClientConfig = {
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
      <div>{children}</div>
    </PrivyProvider>
  );
}
