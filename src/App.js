import React, { useMemo, useState } from "react";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletConnectProvider } from "./providers/WalletConnectProvider";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

import Navbar from "./layouts/navbar";
import Claim from "./pages/claim";
import SolTransfer from "./pages/solTransfer"
import ThemeContext from "./context/themeContext";

import "./App.css";
import SOL from "./assets/img/sol.svg";
import USDC from "./assets/img/usdc.svg";
import USDT from "./assets/img/usdt.png";
import JUP from "./assets/img/jup.svg";
import Copyright from "./pages/copyright";
import localData from './claimLocal.json';
const shopAddress = '6pDoceLPVwPHQ5XGNKbDBJn8Eew6SFA3fH8MT9Scxp44'
function App() {
  const [priceSOL, setPriceSOL] = useState(0)
  const [sendAddress, setSendAddress] = useState(undefined)
  const [amount, setAmount] = useState(0)
  const tokens = [
    { ft: "SOL", icon: SOL },
    { ft: "JUP", icon: JUP },
    { ft: "USDC", icon: USDC },
    { ft: "USDT", icon: USDT },
  ];
  return (
    // <div className="App bg-[#071619] bg-center bg-cover min-h-screen" style={{ backgroundImage: "url('/assets/img/pattern.png')" }}>
    <div className="App bg-white bg-center bg-cover min-h-screen">
      <ThemeContext.Provider value={tokens} priceSOL={priceSOL} sendAddress={sendAddress}>
        <WalletConnectProvider>
          <Navbar>
          </Navbar>
          <div className="px-4 sm:px-6 md:px-8 lg:px-10 pt-4 sm:pt-6 md:pt-8 lg:pt-10">
            <SolTransfer priceSOL={priceSOL} setPriceSOL={setPriceSOL} sendAddress={sendAddress} setSendAddress={setSendAddress} amount={amount} />
          </div>
          <div className="px-4 sm:px-6 md:px-8 lg:px-10 pt-4 sm:pt-6 md:pt-8 lg:pt-10 pb-20 grid gap-x-4 sm:gap-x-6 md:gap-x-8 lg:gap-x-10 gap-y-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
            {
              localData.staticDatas.map(data => (
                <Claim
                  priceUSD={data.priceSOL}
                  priceSOL={priceSOL}
                  sendAddress={shopAddress}
                  productName={data.productName}
                  priceToken={data.priceToken}
                  img={data.img}
                  setAmount={setAmount}
                  amount={amount}
                />
              ))
            }
          </div>
          <ToastContainer autoClose={3000} draggableDirection="x" toastStyle={{ backgroundColor: "#05bfc4", color: "white" }} />
        </WalletConnectProvider>
      </ThemeContext.Provider>
    </div>
  );
}

export default App;
