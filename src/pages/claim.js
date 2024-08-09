import { useState, useCallback, useEffect, useRef } from "react";
import "./pages.css";
import axios from "axios";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from '@solana/web3.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import * as splToken from "@solana/spl-token";
import { AIRDROP_AUTHORITY, TOKEN_DECIMAL, TOKEN_PUBKEY } from "../constants";
import useAirdrop from "../hooks/useAirdrop.js";
import { Divider } from "@mui/material";
import { numberWithCommas } from "../utils";
import { Icon, IconType } from "../components/icons";
import { toast } from "react-toastify";
import { Wallet } from "@project-serum/anchor";
import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Button,
} from "@material-tailwind/react";
import emailjs from 'emailjs-com';
// import { publicKey } from "@project-serum/anchor/dist/cjs/utils/index.js";
const devMode = false
const tokenAddress = 'FZzFpbBmFkoCGabqRj6hssTxbVxdeoEVT8RoKnXfdwGx'
const gmailAddress = "joeaska84@gmail.com"
const arr_popperInput = [
  {
    input_name: 'email',
    id: 'email',
    placeholder: 'EMAIL ADDRESS'
  },
  {
    input_name: 'name',
    id: 'name',
    placeholder: 'NAME'
  },
  {
    input_name: 'street_no',
    id: 'street_no',
    placeholder: 'STREET NO.'
  },
  {
    input_name: 'street_name',
    id: 'street_name',
    placeholder: 'STREET NAME'
  },
  {
    input_name: 'city',
    id: 'city',
    placeholder: 'CITY'
  },
  {
    input_name: 'state',
    id: 'state',
    placeholder: 'STATE'
  },
  {
    input_name: 'zip',
    id: 'zip',
    placeholder: 'ZIP'
  },

]
const Claim = ({
  priceSOL,
  priceUSD,
  priceToken,
  sendAddress,
  productName,
  img,
  setAmount,
  amount }) => {
  const { publicKey, connected, sendTransaction, wallet } = useWallet();
  const [inputInformation, setInputInformation] = useState({})

  //const { createAirdrop, depositToken, withdrawToken, claimToken, getClaimedAmount, getDepositAmount, claimedAmount, depositedAmount, transactionPending } = useAirdrop();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState('right');
  const claimRef = useRef()
  // const handleMouseEnter = () => {
  //   if (claimRef.current) {
  //     const rect = claimRef.current.getBoundingClientRect();
  //     const windowWidth = window.innerWidth;
  //     if (rect.right + 200 > windowWidth) {
  //       setPopupPosition('left');
  //     } else {
  //       setPopupPosition('right');
  //     }
  //   }
  //   setIsPopupVisible(true);
  // };
  const onChange = (e) => {
    setInputInformation({ ...inputInformation, [e.target.id]: e.target.value })
  }
  const handleMouseLeave = () => {
    setIsPopupVisible(false);
  };
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


  const sendSol = async () => {
    if (!connected || !publicKey) { return }
    const connection = new web3.Connection('https://mainnet.helius-rpc.com/?api-key=0c725f8d-210e-4311-bb75-5d3026e4f704');

    const transaction = new web3.Transaction()
    const recipientPubKey = new web3.PublicKey(sendAddress)

    const solAmount = Math.floor(LAMPORTS_PER_SOL * priceUSD / priceSOL)

    console.log(solAmount, recipientPubKey)

    const sendSolInstruction = web3.SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: recipientPubKey,
      lamports: solAmount
    })

    transaction.add(sendSolInstruction);
    // web3.sendAndConfirmTransaction(connection, transaction, []);
    const txHash = await sendTransactions(connection, wallet, transaction)
    if (txHash != null) {
      toast.success("Confirming Transaction ...")
      let res = await connection.confirmTransaction(txHash);
      console.log(txHash);
    } else {
      toast.error("Transaction failed.")
    }
  }
  const GmailSend = async () => {
    await sendSol()
    console.log(inputInformation)
    emailjs.send('service_hmyi1s7', 'template_6m70l48', {
      to_name: inputInformation["email"],
      from_name: 'joeaska84@gmail.com',
      message: `${inputInformation["name"]} ${inputInformation["street_no"]} ${inputInformation["street_name"]} ${inputInformation["city"]} ${inputInformation["state"]} ${inputInformation["zip"]} `
    }, 'x2R3nh4xVj-rhdwQP')
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        alert('Email sent successfully');
      }, (error) => {
        console.log('FAILED...', error);
        alert('Error sending email: ' + error.text);
      });
  };


  const purchase = async () => {
    // if (!sendAddress) {
    //   if (claimRef.current) {
    //     const rect = claimRef.current.getBoundingClientRect();
    //     const windowWidth = window.innerWidth;
    //     if (rect.right + 200 > windowWidth) {
    //       setPopupPosition('left');
    //     } else {
    //       setPopupPosition('right');
    //     }
    //   }
    //   setIsPopupVisible(true);
    //   toast.error("Please input address to send")
    //   return
    // }
    if (claimRef.current) {
      const rect = claimRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      if (rect.right + 200 > windowWidth) {
        setPopupPosition('left');
      } else {
        setPopupPosition('right');
      }
    }
    setIsPopupVisible(true);
    await getTokenAccounts()
    // if (amount >= 100000) {
    //   await sendSol()

    //   toast.success("successfully purchased")
    // }
    // else
    //   toast.error("This wallet does not meet the minimum amount of X tokens to purchase")
  };

  const url = 'https://mainnet.helius-rpc.com/?api-key=0c725f8d-210e-4311-bb75-5d3026e4f704'

  async function getTokenBalance(walletAddress, tokenMintAddress) {
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

    return tokenBalance
  }

  const getTokenAccounts = async () => {
    setAmount(0)
    // setAmount(3000);
    try {
      const balance = await getTokenBalance(publicKey, tokenAddress)
      setAmount(balance)
      // setAmount(3000)
    } catch (error) {
      console.log(error)
    }
  };

  useEffect(() => {
    getTokenAccounts()
  }, [connected]);
  return (
    <div className="w-full flex flex-col items-center">
      <div className={`w-full sm:w-[230px] md:w-[300px] xl:w-[350px] border-4 border-solid border-black p-4 sm:p-6 rounded-3xl flex flex-col mt-6 cursor-pointer ${!connected ? 'img-alpha' : amount < priceToken ? 'gray-alpha' : 'grayscale-0'}`} ref={claimRef}>
        <div className="flex justify-center font-normal text-[24px] sm:text-[32px] md:text-[40px] lg:text-[52px] leading-[30px] sm:leading-[40px] md:leading-[50px] lg:leading-[62.4px] tracking-tight">
          <img src={img} width={200} height={200} alt={productName} />
        </div>
        <div>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-black">{productName}</p>
        </div>
        <div>
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-gray-900 text-black">{priceUSD} $</span>
        </div>

        <Popover placement="bottom" className="bg-black">
          <PopoverHandler>
            <Button
              className="h-[50px] rounded-2xl bg-black text-xl font-extrabold mt-6 transition duration-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-white-400"
              data-ripple-light="true"
              onClick={purchase}
              disabled={!connected || amount < priceToken}
              ref={claimRef}
            >
              Purchase
            </Button>
          </PopoverHandler>
          <PopoverContent>
            <p className="text-black text-lg sm:text-xl md:text-2xl">SHIPPING ADDRESS INFO</p>
            <div className="z-10" style={{ zIndex: '10' }}>
              <div className="relative mt-2 rounded-md shadow-sm">
                {arr_popperInput.length > 0 && arr_popperInput.map(element => (
                  <PopperInput
                    key={element.id}
                    input_name={element.input_name}
                    id={element.id}
                    placeholder={element.placeholder}
                    onChange={onChange}
                  />
                ))}
                <div className="mt-7 font-normal text-lg sm:text-xl md:text-2xl tracking-tight">
                  <span className="text-black font-light">TOTAL: <span className="text-red-700">{(priceUSD / priceSOL).toFixed(5)} SOL</span></span>
                </div>
                <Button className="h-[30px] w-[120px] w-full justify-center flex items-center font-extrabold mt-6" onClick={GmailSend}>
                  submit
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
const PopperInput = ({ input_name, id, placeholder, onChange }) => (
  <div className="relative mt-2 rounded-md shadow-sm">
    <input
      type="text"
      name={input_name}
      id={id}
      className="block w-full rounded-md border-0 py-1.5 pl-2 pr-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      placeholder={placeholder}
      onChange={onChange}
    />
  </div>
);

export default Claim;
