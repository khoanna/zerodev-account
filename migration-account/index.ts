import {KERNEL_V3_1, KERNEL_V3_2} from "@zerodev/sdk/constants";
import {createEcdsaKernelMigrationAccount, signerToEcdsaValidator} from "@zerodev/ecdsa-validator";
import {entryPoint, publicClient, signer} from "../config";
import {createKernelAccountClient} from "@zerodev/sdk";
import {http, zeroAddress} from "viem";
import {sepolia} from "viem/chains";

const originalKernelVersion = KERNEL_V3_1;
const migrationVersion = KERNEL_V3_2;

const main = async () => {
  const migrationAccount = await createEcdsaKernelMigrationAccount(publicClient, {
    entryPoint,
    signer,
    migrationVersion: {
      from: originalKernelVersion,
      to: migrationVersion,
    },
  });

  const kernelClient = createKernelAccountClient({
    account: migrationAccount,
    chain: sepolia,
    bundlerTransport: http(process.env.ZERODEV_RPC),
    client: publicClient,
  });

  // Using migration account to send user operation like a normal account
  const userOpHash = await kernelClient.sendUserOperation({
    callData: await migrationAccount.encodeCalls([
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
};

main();
