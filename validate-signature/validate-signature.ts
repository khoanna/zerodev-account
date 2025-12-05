import "dotenv/config";
import {createKernelAccount, verifyEIP6492Signature} from "@zerodev/sdk";
import {hashMessage} from "viem";
import {signerToEcdsaValidator} from "@zerodev/ecdsa-validator";
import {signer, entryPoint, kernelVersion, publicClient} from "../config/index.ts";

async function main() {
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
  });

  console.log("Account address:", account.address);

  const signature = await account.signMessage({
    message: "hello world",
  });

  const isValid = await verifyEIP6492Signature({
    signer: account.address,
    hash: hashMessage("hello world"),
    signature: signature,
    client: publicClient,
  });

  console.log(isValid);
}

main();
