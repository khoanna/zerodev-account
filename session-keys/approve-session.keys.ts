import {signerToEcdsaValidator} from "@zerodev/ecdsa-validator";
import {toECDSASigner} from "@zerodev/permissions/signers";
import {publicClient, entryPoint, kernelVersion, signer} from "../config";
import {addressToEmptyAccount, createKernelAccount, createKernelAccountClient} from "@zerodev/sdk";
import {serializePermissionAccount, toPermissionValidator} from "@zerodev/permissions";
import {http} from "viem";
import {sepolia} from "viem/chains";
import { sudoPolicy } from "./policy";

// === OWNER ===
export async function approveSessionKey(sessionKeyAddress: `0x${string}`) {
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    entryPoint,
    kernelVersion,
    signer,
  });

  const emptyAccount = addressToEmptyAccount(sessionKeyAddress);

  const emptySessionKeySigner = await toECDSASigner({signer: emptyAccount});

  const permissionPlugin = await toPermissionValidator(publicClient, {
    entryPoint,
    kernelVersion,
    signer: emptySessionKeySigner,
    policies: [
      sudoPolicy
    ],
  });

  const sessionKeyAccount = await createKernelAccount(publicClient, {
    entryPoint,
    kernelVersion,
    plugins: {
      sudo: ecdsaValidator,
      regular: permissionPlugin,
    },
  });

  return await serializePermissionAccount(sessionKeyAccount);
}

export async function revokeSessionKey(sessionKeyAddress: `0x${string}`) : Promise<`0x${string}`> {
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    entryPoint,
    kernelVersion,
    signer,
  });

  const emptyAccount = addressToEmptyAccount(sessionKeyAddress);

  const emptySessionKeySigner = await toECDSASigner({signer: emptyAccount});

  const permissionPlugin = await toPermissionValidator(publicClient, {
    entryPoint,
    kernelVersion,
    signer: emptySessionKeySigner,
    policies: [
      sudoPolicy
    ],
  });

  const sudoAccount = await createKernelAccount(publicClient, {
    entryPoint,
    kernelVersion,
    plugins: {
      sudo: ecdsaValidator,
    },
  });

  const sudoKernelClient = createKernelAccountClient({
    account: sudoAccount,
    chain: sepolia,
    bundlerTransport: http(process.env.ZERODEV_RPC),
    client: publicClient,
  });

  const txHash = await sudoKernelClient.uninstallPlugin({
    plugin: permissionPlugin,
  });
    return txHash;
}
