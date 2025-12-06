import {toWebAuthnSigner, createWeightedValidator} from "@zerodev/weighted-validator";
import {toWebAuthnKey, WebAuthnMode} from "@zerodev/webauthn-key";
import {WeightedValidatorContractVersion} from "@zerodev/weighted-validator";
import {publicClient, entryPoint, kernelVersion} from "../config";
import { createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import { http } from "viem";
import { sepolia } from "viem/chains";

const validatorContractVersion = WeightedValidatorContractVersion.V0_0_2_PATCHED;

async function main() {
  // Create or get WebAuthn keys
  const webAuthnKey1 = await toWebAuthnKey({
    passkeyName: "passkey1",
    passkeyServerUrl: process.env.PASSKEY_SERVER_URL as string,
    mode: WebAuthnMode.Login,
    rpID: "example.com",
  });

  const webAuthnKey2 = await toWebAuthnKey({
    passkeyName: "passkey2",
    passkeyServerUrl: process.env.PASSKEY_SERVER_URL as string,
    mode: WebAuthnMode.Login,
    rpID: "example.com",
  });

  // Create WebAuthn signers
  const passKeySigner1 = await toWebAuthnSigner(publicClient, {
    webAuthnKey: webAuthnKey1,
  });

  const passKeySigner2 = await toWebAuthnSigner(publicClient, {
    webAuthnKey: webAuthnKey2,
  });

  const multiSigValidator = await createWeightedValidator(publicClient, {
    entryPoint,
    kernelVersion,
    validatorContractVersion,
    signer: passKeySigner1, // The current signer being used
    config: {
      threshold: 100,
      signers: [
        {publicKey: passKeySigner1.account.address, weight: 50},
        {publicKey: passKeySigner2.account.address, weight: 50},
      ],
    },
  });

    // === Create Kernel Account ===
    const account = await createKernelAccount(publicClient, {
      plugins: {
        sudo: multiSigValidator,
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

    // === User Kernel Account To Send User Operation ===

}
