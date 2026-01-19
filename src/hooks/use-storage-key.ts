/**
 * Storage Key Derivation (for Method #2: Embedded Wallet)
 * 
 * Derives a Welshare storage keypair from the user's Ethereum wallet.
 * This keypair is used to sign submissions to the Welshare API.
 */

import {
  SignTypedDataParams,
  usePrivy,
  useSignTypedData,
} from "@privy-io/react-auth";
import { deriveStorageKeypair, SessionKeyData } from "@welshare/sdk";
import { useState } from "react";

export const useStorageKey = () => {
  const { ready, user } = usePrivy();
  const { signTypedData } = useSignTypedData();
  const [storageKey, setStorageKey] = useState<SessionKeyData>();

  const makeStorageKey = async () => {
    if (!ready || !user?.wallet?.address) {
      console.error("Wallet not available");
      return;
    }

    // Derive storage keypair by signing a typed message
    const storageKeyData = await deriveStorageKeypair(
      async (params: Record<string, unknown>) => {
        const { signature } = await signTypedData(params as SignTypedDataParams);
        return signature as `0x${string}`;
      },
      user.wallet.address as `0x${string}`
    );

    setStorageKey(storageKeyData);
  };

  return { storageKey, makeStorageKey };
};
