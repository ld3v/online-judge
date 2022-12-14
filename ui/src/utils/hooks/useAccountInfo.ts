
import { currentAccount } from "@/services/account";
import { TAccount } from "@/types/account";
import { useEffect, useState } from "react";

interface TAccountInfoHookProps {
  callback?: (account: TAccount | undefined) => void | Promise<void>;
}
type TAccountInfoHook = {
  account: TAccount | undefined;
  setAccount: (account: TAccount | undefined) => void;
  loading: boolean;
};
const useAccountInfo = ({
  callback,
}: TAccountInfoHookProps): TAccountInfoHook => {
  const [loading, setLoading] = useState<boolean>(true);
  const [account, setAccount] = useState<TAccount | undefined>(undefined);

  const handleSetAccount = async (acc: TAccount | undefined) => {
    setLoading(false);
    await callback?.(acc);
    if (!acc || !account || acc.id !== account.id) {
      setAccount(acc);
    }
  }

  const handleGetCurrent = async () => {
    const authLcStr = localStorage.getItem(`${LC_STR_PREFIX}AUTH`);
    // Check if local-storage exist JWT
    if (!authLcStr) {
      handleSetAccount(undefined);
      return;
    }
    if (account) {
      handleSetAccount(account);
      return;
    }
    setLoading(true);
    const acc = await currentAccount();
    if (!acc || acc.isError) {
      localStorage.removeItem(`${LC_STR_PREFIX}AUTH`);
      handleSetAccount(undefined);
      return;
    }
    handleSetAccount(acc);
  }

  useEffect(() => {
    handleGetCurrent();
  }, []);

  return {
    account,
    setAccount: handleSetAccount,
    loading
  };
}

export default useAccountInfo;