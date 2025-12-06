import "dotenv/config";
import {
  createKernelAccount,
  createZeroDevPaymasterClient,
  createKernelAccountClient,
  KernelValidator,
  addressToEmptyAccount,
} from "@zerodev/sdk";
import {
  toPermissionValidator,
  deserializePermissionAccount,
  serializePermissionAccount,
} from "@zerodev/permissions";
import {toECDSASigner} from "@zerodev/permissions/signers";
import {toSudoPolicy} from "@zerodev/permissions/policies";
import {http, type Address, zeroAddress, PrivateKeyAccount} from "viem";
import {generatePrivateKey, privateKeyToAccount} from "viem/accounts";
import {sepolia} from "viem/chains";
import {KERNEL_V3_3} from "@zerodev/sdk/constants";
import {
  createWeightedKernelAccountClient,
  createWeightedValidator,
  encodeSignatures,
  toECDSASigner as toWeightedECDSASigner,
  WeightedValidatorContractVersion,
} from "@zerodev/weighted-validator";
import {entryPoint, publicClient, signer, signer2} from "../config";

const sessionPrivateKey = generatePrivateKey();
const sessionSigner = privateKeyToAccount(sessionPrivateKey);

const getApproval = async (signer: PrivateKeyAccount, sessionKeyValidator: KernelValidator) => {
  const weightedSigner = await toWeightedECDSASigner({signer: signer});
  const multisigValidator = await createWeightedValidator(publicClient, {
    entryPoint,
    signer: weightedSigner, // The current signer being used
    config: {
      threshold: 100,
      signers: [
        {publicKey: signer.address as Address, weight: 50},
        {publicKey: signer2.address as Address, weight: 50},
      ],
    },
    kernelVersion: KERNEL_V3_3,
    validatorContractVersion: WeightedValidatorContractVersion.V0_0_2_PATCHED,
  });

  const masterAccount = await createKernelAccount(publicClient, {
    entryPoint,
    plugins: {
      sudo: multisigValidator,
    },
    kernelVersion: KERNEL_V3_3,
  });
  console.log("Account address:", masterAccount.address);
  const kernelPaymaster = createZeroDevPaymasterClient({
    chain: sepolia,
    transport: http(process.env.ZERODEV_RPC),
  });
  const weightedKernelAccountClient = createWeightedKernelAccountClient({
    account: masterAccount,
    chain: sepolia,
    bundlerTransport: http(process.env.ZERODEV_RPC),
    paymaster: {
      getPaymasterData(userOperation) {
        return kernelPaymaster.sponsorUserOperation({userOperation});
      },
    },
  });
  return await weightedKernelAccountClient.approvePlugin({
    plugin: sessionKeyValidator,
    validatorContractVersion: WeightedValidatorContractVersion.V0_0_2_PATCHED,
  });
};

const createSessionKey = async () => {
  const signer1EmptyAccount = addressToEmptyAccount(signer.address);
  const signer1Weighted = await toWeightedECDSASigner({signer: signer1EmptyAccount});
  const multisigValidator = await createWeightedValidator(publicClient, {
    entryPoint,
    signer: signer1Weighted, // The current signer being used
    config: {
      threshold: 100,
      signers: [
        {publicKey: signer.address as Address, weight: 50},
        {publicKey: signer2.address as Address, weight: 50},
      ],
    },
    kernelVersion: KERNEL_V3_3,
    validatorContractVersion: WeightedValidatorContractVersion.V0_0_2_PATCHED,
  });

  const sessionKeyEmptyAccount = addressToEmptyAccount(sessionSigner.address);
  const sessionKeySigner = await toECDSASigner({
    signer: sessionKeyEmptyAccount,
  });

  const sessionKeyValidator = await toPermissionValidator(publicClient, {
    entryPoint,
    signer: sessionKeySigner,
    policies: [toSudoPolicy({})],
    kernelVersion: KERNEL_V3_3,
  });

  // === Collect approvals from both signers ===
  const approval1 = await getApproval(signer, sessionKeyValidator);
  console.log("approval1", approval1);
  const approval2 = await getApproval(signer2, sessionKeyValidator);
  console.log("approval2", approval2);
  let enableSignature;
  if (approval1 && approval2) {
    enableSignature = encodeSignatures([approval1, approval2], true);
  }

  const sessionKeyAccount = await createKernelAccount(publicClient, {
    entryPoint,
    plugins: {
      sudo: multisigValidator,
      regular: sessionKeyValidator,
    },
    kernelVersion: KERNEL_V3_3,
  });

  // Serialize the session key account with its private key
  return await serializePermissionAccount(sessionKeyAccount, sessionPrivateKey, enableSignature);
};

const useSessionKey = async (serializedSessionKey: string) => {
  // Deserialize the session key account
  const sessionKeyAccount = await deserializePermissionAccount(
    publicClient,
    entryPoint,
    KERNEL_V3_3,
    serializedSessionKey
  );
  console.log("sessionKeyAccount", sessionKeyAccount.address);

  const kernelPaymaster = createZeroDevPaymasterClient({
    chain: sepolia,
    transport: http(process.env.ZERODEV_RPC),
  });

  const kernelClient = createKernelAccountClient({
    account: sessionKeyAccount,
    chain: sepolia,
    bundlerTransport: http(process.env.ZERODEV_RPC),
    paymaster: {
      getPaymasterData(userOperation) {
        return kernelPaymaster.sponsorUserOperation({userOperation});
      },
    },
  });

  const userOpHash = await kernelClient.sendUserOperation({
    callData: await sessionKeyAccount.encodeCalls([
      {
        to: zeroAddress,
        value: BigInt(0),
        data: "0x",
      },
    ]),
  });

  console.log("UserOp hash:", userOpHash);

  const {receipt} = await kernelClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });
};

const main = async () => {
  const serializedSessionKey = await createSessionKey();
  await useSessionKey(serializedSessionKey);
  process.exit(0);
};

main();
