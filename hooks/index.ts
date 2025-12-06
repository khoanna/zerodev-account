import "dotenv/config";
import { createKernelAccount, createZeroDevPaymasterClient, createKernelAccountClient } from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { toPermissionValidator } from "@zerodev/permissions";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { toSudoPolicy } from "@zerodev/permissions/policies";
import { encodeFunctionData, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { toSpendingLimitHook } from "@zerodev/hooks";
import { ERC20_ADDRESS, ERC20_ABI } from "./ERC20.ts";
import { signer, entryPoint, publicClient, paymasterClient, kernelVersion } from "../config/index.ts";

const main = async () => {
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint,
    kernelVersion,
  });

  const ecdsaSigner = await toECDSASigner({
    signer: privateKeyToAccount(generatePrivateKey()),
  });

  const sudoPolicy = toSudoPolicy({});

  const permissoinPlugin = await toPermissionValidator(publicClient, {
    signer: ecdsaSigner,
    policies: [sudoPolicy],
    entryPoint,
    kernelVersion,
  });

  const spendingLimitHook = await toSpendingLimitHook({
    limits: [{ token: ERC20_ADDRESS, allowance: BigInt(4337) }],
  });

  const kernelAccount = await createKernelAccount(publicClient, {
    entryPoint,
    kernelVersion,
    plugins: {
      sudo: ecdsaValidator,
      regular: permissoinPlugin,
      hook: spendingLimitHook,
    }
  });

  const kernelClient = createKernelAccountClient({
    account: kernelAccount,
    chain: sepolia,
    bundlerTransport: http(process.env.ZERODEV_RPC),
    paymaster: {
      getPaymasterData(userOperation) {
        return paymasterClient.sponsorUserOperation({ userOperation });
      },
    },
  });

  const amountToMint = BigInt(10000);

  const mintData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "mint",
    args: [kernelAccount.address, amountToMint],
  });

  const mintTransactionHash = await kernelClient.sendTransaction({
    to: ERC20_ADDRESS,
    data: mintData,
  });

  console.log("Mint transaction hash:", mintTransactionHash);

  const amountToTransfer = BigInt(4337);
  const transferData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [signer.address, amountToTransfer],
  });

  const response = await kernelClient.sendTransaction({
    to: ERC20_ADDRESS,
    data: transferData,
  });

  console.log("Transfer transaction hash:", response);

  const transferDataWillFail = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [signer.address, BigInt(1)],
  });

  try {
    await kernelClient.sendTransaction({
      to: ERC20_ADDRESS,
      data: transferDataWillFail,
    });
  } catch (error) {
    console.log("Transfer failed as expected");
  }
};

main();
