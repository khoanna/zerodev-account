import "dotenv/config";
import {
  createKernelAccount,
  createKernelAccountClient,
} from "@zerodev/sdk";
import {signerToEcdsaValidator} from "@zerodev/ecdsa-validator";
import {http, zeroAddress} from "viem";
import {sepolia} from "viem/chains";
import {signer, entryPoint, kernelVersion, publicClient, paymasterClient} from "../config/index.ts";


const main = async () => {
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

  // === Send User Operation ===
  const userOpHash = await kernelClient.sendUserOperation({
    callData: await account.encodeCalls([
      {
        to: zeroAddress,
        value: BigInt(0),
        data: "0x",
      },
    ]),
  });
  console.log("userOp hash:", userOpHash);
  const _receipt = await kernelClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });
  console.log("bundle txn hash: ", _receipt.receipt.transactionHash);
  console.log("userOp completed");

  process.exit(0);
};

main()
