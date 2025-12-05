import "dotenv/config";
import { createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { http } from "viem";
import { sepolia } from "viem/chains";
import { signer, entryPoint, kernelVersion, publicClient, paymasterClient } from "../config/index.ts";
import { EXEC_TYPE } from "@zerodev/sdk/constants";

const main = async () => {
  // === Create ECDSA Validator Plugin ===
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint,
    kernelVersion,
  }); // === Create Kernel Account ===
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
  });

  // === Send Batch Transaction ===
  const txHas = await kernelClient.sendTransaction({
    calls: [
      {
        to: "0xADDRESS",
        value: BigInt(0),
        data: "0xDATA",
      },
      {
        to: "0xADDRESS",
        value: BigInt(0),
        data: "0xDATA",
      },
    ],
  });

  // === Send Batch Operation ===
  const userOpHash = await kernelClient.sendUserOperation({
    callData: await account.encodeCalls(
      [
        {
          to: "0xADDRESS",
          value: BigInt(0),
          data: "0xDATA",
        },
        {
          to: "0xADDRESS",
          value: BigInt(0),
          data: "0xDATA",
        },
      ],
      "call",
      EXEC_TYPE.TRY_EXEC
    ),
  });
};

main();
