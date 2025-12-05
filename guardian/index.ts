import "dotenv/config";
import {createKernelAccount, createKernelAccountClient} from "@zerodev/sdk";
import {signerToEcdsaValidator} from "@zerodev/ecdsa-validator";
import {encodeFunctionData, Hex, http, parseAbi, zeroAddress} from "viem";
import {sepolia} from "viem/chains";
import {
  signer,
  entryPoint,
  kernelVersion,
  publicClient,
  paymasterClient,
  guardianSigner,
} from "../config/index.ts";
import {
  recoveryExecutorAddress,
  recoveryExecutorFunction,
  recoveryExecutorSelector,
} from "./constants.ts";
import {getValidatorAddress} from "@zerodev/ecdsa-validator";
import {privateKeyToAccount} from "viem/accounts";

const main = async () => {
  const newSigner = privateKeyToAccount(process.env.NEW_PRIVATE_KEY as Hex);

  // === Create ECDSA Validator Plugin ===
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint,
    kernelVersion,
  });

  // === Create Guardian ECDSA Validator Plugin ===
  const guardianValidator = await signerToEcdsaValidator(publicClient, {
    signer: guardianSigner,
    entryPoint,
    kernelVersion,
  });

  // === Missing Account ===
  const account = await createKernelAccount(publicClient, {
    entryPoint,
    kernelVersion,
    plugins: {
      sudo: ecdsaValidator,
      regular: guardianValidator,
      action: {
        address: recoveryExecutorAddress,
        selector: recoveryExecutorSelector,
      },
    },
  });

  // === Create Kernel Account Client ===
  const kernelClient = createKernelAccountClient({
    account,
    chain: sepolia,
    bundlerTransport: http(process.env.ZERODEV_RPC),
    client: publicClient
  });

  // === Recovery ===
  const userOpHash = await kernelClient.sendUserOperation({
    callData: encodeFunctionData({
      abi: parseAbi([recoveryExecutorFunction]),
      functionName: "doRecovery",
      args: [getValidatorAddress(entryPoint, kernelVersion), newSigner.address],
    }),
  });

  // === New Account ===
  const newEcdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer: newSigner,
    entryPoint,
    kernelVersion: kernelVersion,
  });

  const newAccount = await createKernelAccount(publicClient, {
    address: account.address,
    entryPoint,
    plugins: {
      sudo: newEcdsaValidator,
    },
    kernelVersion: kernelVersion,
  });

  const newKernelClient = createKernelAccountClient({
    account: newAccount,
    chain: sepolia,
    bundlerTransport: http(process.env.ZERODEV_RPC),
    paymaster: paymasterClient,
  });
};

main();
