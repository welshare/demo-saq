import {
  SignTypedDataParams,
  usePrivy,
  useSignTypedData,
} from "@privy-io/react-auth";
import { deriveStorageKeypair, SessionKeyData } from "@welshare/sdk";
import { useState } from "react";

export const useStorageKey = () => {
  const { ready, authenticated, user } = usePrivy();
  const { signTypedData } = useSignTypedData();

  const [storageKey, setStorageKey] = useState<SessionKeyData>();

  const makeStorageKey = async () => {
    if (!ready || !user?.wallet?.address) {
      console.error("only callable with a wallet");
      return;
    }
    const storageKeyData = await deriveStorageKeypair(
      async (params: Record<string, unknown>) => {
        console.log(params);
        const { signature } = await signTypedData(
          params as SignTypedDataParams
        );
        return signature as `0x${string}`;
      },
      user.wallet.address as `0x${string}`
    );
    setStorageKey(storageKeyData);
    
  };

  return { storageKey, makeStorageKey };
};
