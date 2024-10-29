import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Web3Modal from "web3modal";

type SignerContextType = {
  signer?: JsonRpcSigner;
  address?: string;
  loading: boolean;
  connectWallet: () => Promise<void>;
};

const SignerContext = createContext<SignerContextType | undefined>(undefined);

const useSigner = () => {
  const context = useContext(SignerContext);
  if (!context) {
    throw new Error("useSigner must be used within a SignerProvider");
  }
  return context;
};

export const SignerProvider = ({ children }: { children: ReactNode }) => {
  const [signer, setSigner] = useState<JsonRpcSigner>();
  const [address, setAddress] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const web3modal = new Web3Modal();
    if (web3modal.cachedProvider) connectWallet();

    const handleAccountsChanged = () => {
      connectWallet();
    };

    window.ethereum?.on("accountsChanged", handleAccountsChanged);

    // Cleanup listener on unmount
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    try {
      const web3modal = new Web3Modal({ cacheProvider: true });
      const instance = await web3modal.connect();
      const provider = new Web3Provider(instance);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setSigner(signer);
      setAddress(address);
    } catch (e) {
      console.error("Failed to connect wallet:", e);
    } finally {
      setLoading(false);
    }
  };

  const contextValue = { signer, address, loading, connectWallet };

  return (
    <SignerContext.Provider value={contextValue}>
      {children}
    </SignerContext.Provider>
  );
};

export default useSigner;
