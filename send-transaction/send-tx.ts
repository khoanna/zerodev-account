import "dotenv/config";
import {http, zeroAddress} from "viem";
import {createKernelAccount, createKernelAccountClient} from "@zerodev/sdk";
import {signer, entryPoint, kernelVersion, publicClient, paymasterClient} from "../config/index.ts";
import {signerToEcdsaValidator} from "@zerodev/ecdsa-validator";
import {sepolia} from "viem/chains";

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
    kernelVersion,
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

  // === Send Transaction ===
  const txnHash = await kernelClient.sendTransaction({
    to: zeroAddress,
    value: BigInt(0),
    data: "0x",
  });

  console.log("Txn hash:", txnHash);
}
