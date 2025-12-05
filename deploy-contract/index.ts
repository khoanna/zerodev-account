import "dotenv/config";
import { GreeterAbi, GreeterBytecode } from "./constants.ts";
import {sepolia} from "viem/chains";
import { entryPoint, kernelVersion, paymasterClient, publicClient, signer } from "../config/index.ts";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import {http} from "viem";

async function main() {
  // === Create ECDSA Validator Plugin ===
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
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

  console.log("Account address:", kernelClient.account.address);

  const txnHash = await kernelClient.sendTransaction({
    callData: await kernelClient.account.encodeDeployCallData({
      abi: GreeterAbi,
      bytecode: GreeterBytecode,
    }),
  });

  console.log("Txn hash:", txnHash);
}

main();