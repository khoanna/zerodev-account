import "dotenv/config";
import { toRemoteSigner, RemoteSignerMode } from "@zerodev/remote-signer";
import { entryPoint, kernelVersion, paymasterClient, publicClient } from "../config";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { http } from "viem";
import { createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import { sepolia } from "viem/chains";

const createKey = async () => {
  const remoteSigner = await toRemoteSigner({
    apiKey: process.env.ZERODEV_API_KEY!,
    mode: RemoteSignerMode.Create,
  });
};

const getKey = async () => {
  const remoteSigner = await toRemoteSigner({
    apiKey: process.env.ZERODEV_API_KEY!,
    mode: RemoteSignerMode.Get,
  });

  // === Create ECDSA Validator ===
 const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer: remoteSigner,
    entryPoint,
    kernelVersion,
  });

 // === Create Kernel Account ===
  const account = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint,
    kernelVersion
  });

  // === Create Kernel Account Client ===
  const kernelClient = createKernelAccountClient({
    account,
    chain: sepolia,
    bundlerTransport: http(process.env.ZERODEV_RPC),
    client: publicClient,
    paymaster: {
      getPaymasterData(userOperation) {
        return paymasterClient.sponsorUserOperation({userOperation});
      },
    },
  });

  // Use Kernel Client to send user operations... 
};
