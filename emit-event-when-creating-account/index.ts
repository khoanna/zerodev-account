import "dotenv/config";
import {createKernelAccount, createKernelAccountClient} from "@zerodev/sdk";
import {signerToEcdsaValidator} from "@zerodev/ecdsa-validator";
import {http, zeroAddress, decodeEventLog} from "viem";
import {sepolia} from "viem/chains";
import {PLUGIN_TYPE} from "@zerodev/sdk/constants";
import {
  signer,
  publicClient,
  kernelVersion,
  entryPoint,
  identifierEmittedAbi,
  paymasterClient,
} from "../config/index.ts";

if (!process.env.ZERODEV_RPC || !process.env.PRIVATE_KEY) {
  throw new Error("ZERODEV_RPC or PRIVATE_KEY is not set");
}

const main = async () => {
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint,
    kernelVersion,
  });

  const account = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint,
    kernelVersion,
    pluginMigrations: [
      {
        address: "0x_CUSTOM_VALIDATOR", // https://github.com/zerodevapp/kernel/blob/ab30532763de3cdbe05dab7821652f11cc0a01c7/src/validator/EmitIdentifierValidator.sol
        type: PLUGIN_TYPE.VALIDATOR,
        data: "0x", // Encoded parameters for the onInstall function
      },
    ],
  });
  console.log("My account:", account.address);

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
  console.log({txHash: _receipt.receipt.transactionHash});

    for (const log of _receipt.logs) {
      try {
        const event = decodeEventLog({
          abi: identifierEmittedAbi,
          ...log,
        });
        if (event.eventName === "IdentifierEmitted") {
          console.log({id: event.args.id, kernel: event.args.kernel});
        }
      } catch {}
    }
    console.log("userOp completed");
};

