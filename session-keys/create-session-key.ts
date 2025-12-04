import {toECDSASigner} from "@zerodev/permissions/signers";
import {generatePrivateKey, privateKeyToAccount} from "viem/accounts";
import { entryPoint, kernelVersion, publicClient } from "../config";
import { deserializePermissionAccount } from "@zerodev/permissions";
import { sepolia } from "viem/chains";
import { http } from "viem";
import { createKernelAccountClient } from "@zerodev/sdk";

const sessionPrivateKey = generatePrivateKey();

// === AGENTS ===
export async function createSessionKey(): Promise<string> {
  const sessionKeySigner = await toECDSASigner({
    signer: privateKeyToAccount(sessionPrivateKey),
  });

  return sessionKeySigner.account.address;
}

export async function usingSessionKey(approval: string) {
  const sessionKeySigner = await toECDSASigner({
    signer: privateKeyToAccount(sessionPrivateKey),
  });

  const sessionKeyAccount = await deserializePermissionAccount(
    publicClient,
    entryPoint,
    kernelVersion,
    approval,
    sessionKeySigner
  );

  const kernelClient = createKernelAccountClient({
    account: sessionKeyAccount,
    chain: sepolia,
    bundlerTransport: http(process.env.ZERODEV_RPC),
    client: publicClient,
  });

  // === Use Kernel Client Send User Operation ===
}
