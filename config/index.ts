import "dotenv/config";
import {
  createZeroDevPaymasterClient,
} from "@zerodev/sdk";
import {http, createPublicClient, parseAbi} from "viem";
import {privateKeyToAccount} from "viem/accounts";
import {sepolia} from "viem/chains";
import {getEntryPoint, KERNEL_V3_1} from "@zerodev/sdk/constants";
import type {Hex, Chain, Account} from "viem";

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
  transport: http(`${process.env.ZERODEV_RPC}?selfFunded=true`),
});

// Deposit fund to your paymaster at dashboard.zerodev.app for sponsoring user operations
const erc20PaymasterClient = createZeroDevPaymasterClient({
  chain: sepolia,
  transport: http(`${process.env.ZERODEV_RPC}?selfFunded=true`),
});

const identifierEmittedAbi = parseAbi([
  "event IdentifierEmitted(bytes id, address indexed kernel)",
])

export {signer, entryPoint, kernelVersion, publicClient, paymasterClient, erc20PaymasterClient, identifierEmittedAbi};