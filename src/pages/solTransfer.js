import { useState, useCallback, useEffect, useContext } from "react";
import "./pages.css";
import axios from "axios";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from '@solana/web3.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import * as splToken from "@solana/spl-token";
import { AIRDROP_AUTHORITY, TOKEN_DECIMAL, TOKEN_PUBKEY } from "../constants/index.js";
import useAirdrop from "../hooks/useAirdrop.js";
import { Divider } from "@mui/material";
import { numberWithCommas } from "../utils/index.js";
import { Icon, IconType } from "../components/icons.js";
import { toast } from "react-toastify";
import { Wallet } from "@project-serum/anchor";
import ThemeContext from "../context/themeContext.js";

// import { publicKey } from "@project-serum/anchor/dist/cjs/utils/index.js";
const devMode = false
const tokenAddress = 'FZzFpbBmFkoCGabqRj6hssTxbVxdeoEVT8RoKnXfdwGx'
const SolTransfer = ({ priceSOL, setPriceSOL, sendAddress, setSendAddress, amount }) => {
  const { publicKey, connected, select, connect, wallets, disconnect, sendTransaction, wallet } = useWallet();

  const handleChange = (evt) => {
    const { value } = evt.target;
    setSendAddress(value);
  };

  //const { createAirdrop, depositToken, withdrawToken, claimToken, getClaimedAmount, getDepositAmount, claimedAmount, depositedAmount, transactionPending } = useAirdrop();

  async function sendTransactions(
    connection,
    wallet,
    transaction
  ) {
    try {
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = wallet.adapter.publicKey
      const signedTransaction = await wallet.adapter.signTransaction?.(
        transaction
      );
      const rawTransaction = signedTransaction.serialize();

      if (rawTransaction) {
        const txid = await connection.sendRawTransaction(
          rawTransaction,
          {
            skipPreflight: true,
            preflightCommitment: "processed",
          }
        );
        return txid;
      } else {
        console.log("error!");
      }
    } catch (e) {
      console.log("tx e = ", e);
      return null;
    }
  }


  // const sendSol = async () => {
  //   if (!connected || !publicKey) { return }
  //   const connection = new web3.Connection('https://mainnet.helius-rpc.com/?api-key=0c725f8d-210e-4311-bb75-5d3026e4f704');

  //   const transaction = new web3.Transaction()
  //   const recipientPubKey = new web3.PublicKey(sendAddress)

  //   const solAmount = Math.floor(LAMPORTS_PER_SOL * 1 / priceSOL)

  //   console.log(solAmount, recipientPubKey)

  //   const sendSolInstruction = web3.SystemProgram.transfer({
  //     fromPubkey: publicKey,
  //     toPubkey: recipientPubKey,
  //     lamports: solAmount
  //   })

  //   transaction.add(sendSolInstruction);
  //   // web3.sendAndConfirmTransaction(connection, transaction, []);
  //   const txHash = await sendTransactions(connection, wallet, transaction)
  //   if (txHash != null) {
  //     toast.success("Confirming Transaction ...")
  //     let res = await connection.confirmTransaction(txHash);
  //     console.log(txHash);
  //   } else {
  //     toast.error("Transaction failed.")
  //   }
  // }

  // const purchase = async () => {
  //   if (!sendAddress) {
  //     toast.error("Please input address to send")
  //     return
  //   }

  //   await getTokenAccounts()
  //   if (amount >= 100000) {
  //     await sendSol()

  //     toast.success("successfully purchased")
  //   }
  //   else
  //     toast.error("This wallet does not meet the minimum amount of X tokens to purchase")
  // };

  const url = 'https://mainnet.helius-rpc.com/?api-key=0c725f8d-210e-4311-bb75-5d3026e4f704'

  //  const getWalletTokenAccount = async (wallet) => {
  //     const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
  //         programId: TOKEN_PROGRAM_ID,
  //     });
  //     return walletTokenAccount.value.map((i) => ({
  //         pubkey: i.pubkey,
  //         programId: i.account.owner,
  //         accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
  //     }));
  // }

  const onWalletConnect = async () => {
    if (!publicKey) {
      const installedWallets = wallets.filter((wallet) => wallet.readyState === "Installed");
      if (installedWallets.length <= 0) {
        toast.warning("Phantom wallet is not installed yet.");
        return;
      }

      for (let i = 0; i < installedWallets.length; i ++) {
        console.log("connect", wallets[i].adapter.name)
        if (wallets[i].adapter.name === "Phantom") {
          select(wallets[i].adapter.name);
          return
        }
      }

      toast.warning("Phantom wallet is not installed yet.");
    } else {
      console.log("disconnect")
      disconnect();
    }
  };

  async function getTokenBalance(walletAddress, tokenMintAddress) {
    try {
      // Connect to the Solana devnet
      const connection = new web3.Connection('https://mainnet.helius-rpc.com/?api-key=0c725f8d-210e-4311-bb75-5d3026e4f704');

      // Create PublicKey objects for the wallet and token mint address
      const walletPublicKey = new web3.PublicKey(walletAddress);
      const tokenMintPublicKey = new web3.PublicKey(tokenMintAddress);

      // Find the associated token account address for the wallet
      const associatedTokenAccountAddress = await web3.PublicKey.findProgramAddress(
        [
          walletPublicKey.toBuffer(),
          splToken.TOKEN_PROGRAM_ID.toBuffer(),
          tokenMintPublicKey.toBuffer(),
        ],
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Fetch the account info for the associated token account
      const accountInfo = await connection.getParsedAccountInfo(associatedTokenAccountAddress[0]);

      // Parse and return the token balance
      const tokenBalance = accountInfo.value.data.parsed.info.tokenAmount.uiAmount;

      console.log(`Token Balance: ${tokenBalance}`);

      setAmount(tokenBalance)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getPricesInUSD();
    const intVal = setInterval(() => {
      getPricesInUSD();
    }, 1 * 60 * 1000); // 5 mins
    return () => clearInterval(intVal);
  }, [connected]);

  const getPricesInUSD = async () => {
    if (!connected) {
      setPriceSOL(0)
      return;
    }
    try {
      const options = {
        method: 'GET',
        url: 'https://api.diadata.org/v1/assetQuotation/Solana/0x0000000000000000000000000000000000000000',
        headers: { 'Content-Type': 'application/json' }
      };

      axios.request(options).then(function (response) {
        const data = response.data
        const price = data?.Price?.toFixed(2)
        setPriceSOL(price)
        console.log(price)
      }).catch(function (error) {
        console.error(error);
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-full flex flex-col items-center ">
      <div className="w-full md:w-[512px] border-4 border-solid border-black p-6 rounded-3xl flex flex-col mt-6">
        {!publicKey ?
          <>
            <button
              className="mt-2 flex flex-row items-center justify-center rounded-3xl px-4 py-2 text-[12px] bg-black"
              style={{ height: '50px' }}
              onClick={onWalletConnect}>
              CONNECT WALLET TO SHOP
            </button>
          </> :
          <>


            {/* <label htmlFor="address">Address to send:</label>
            <input id="address" value={sendAddress} onChange={handleChange} style={{ backgroundColor: "#096067" }} />
             */}
            <span className="text-black">    You have a total amount of</span>

            <div>
              <p class="text-[32px] md:text-[52px] leading-[62.4px] font-medium text-[#10b981]"> {Number(amount).toLocaleString()}</p>
            </div>
            <span className="text-black font-light">   $COOCHIES</span>
            {/* <div className="font-normal text-3xl  tracking-tight">
              <span className="text-black font-light">1 SOL = {priceSOL}$</span>
            </div> */}
            <button
              // className="h-9 flex flex-row items-center justify-center rounded-3xl px-4 py-2 text-[12px] bg-cyan-500"\
              className="mt-5 flex flex-row items-center justify-center rounded-3xl px-4 py-2 text-[12px] bg-black"
              style={{ height: '50px' }}
              onClick={onWalletConnect}>
              DISCONNECT WALLET
            </button>
          </>
        }

      </div>
    </div >
  );
};

export default SolTransfer;
