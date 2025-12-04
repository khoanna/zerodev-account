import "dotenv/config";
import {
  createZeroDevPaymasterClient,
  createKernelAccount,
  createKernelAccountClient,
} from "@zerodev/sdk";
import {http, createPublicClient} from "viem";
import {privateKeyToAccount} from "viem/accounts";
import {sepolia} from "viem/chains";
import {getEntryPoint, KERNEL_V3_1} from "@zerodev/sdk/constants";
import {signerToEcdsaValidator} from "@zerodev/ecdsa-validator";
import {GetKernelVersion} from "@zerodev/sdk/types";
import {EntryPointVersion} from "viem/account-abstraction";
import type {Hex, Client, Chain, Transport, Account} from "viem";

if (!process.env.ZERODEV_RPC) {
  throw new Error("ZERODEV_RPC is not set");
}

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is not set");
}

const signer = privateKeyToAccount(process.env.PRIVATE_KEY as Hex);

const entryPoint = getEntryPoint("0.7");

const kernelVersion = KERNEL_V3_1;

const publicClient = createPublicClient({
  transport: http(process.env.ZERODEV_RPC),
  chain: sepolia,
});

// Deposit fund to your paymaster at dashboard.zerodev.app for sponsoring user operations
const paymasterClient = createZeroDevPaymasterClient({
  chain: sepolia,
  transport: http(process.env.ZERODEV_RPC),
});

export {signer, entryPoint, kernelVersion, publicClient, paymasterClient};
