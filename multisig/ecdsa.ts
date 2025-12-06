import {createWeightedValidator, toECDSASigner} from "@zerodev/weighted-validator";
import {WeightedValidatorContractVersion} from "@zerodev/weighted-validator";
import {privateKeyToAccount} from "viem/accounts";
import {publicClient, entryPoint, kernelVersion, signer, signer2} from "../config";
import {createKernelAccount, createKernelAccountClient} from "@zerodev/sdk";
import { http } from "viem";
import { sepolia } from "viem/chains";

const validatorContractVersion = WeightedValidatorContractVersion.V0_0_2_PATCHED;



const main = async () => {
  const edcsaSigner1 = await toECDSASigner({signer: signer});
  const edcsaSigner2 = await toECDSASigner({signer: signer2});

    // === Create MultiSig Validator Plugin ===
  const multiSigValidator = await createWeightedValidator(publicClient, {
    entryPoint,
    kernelVersion,
    validatorContractVersion,
    signer: edcsaSigner1, // The current signer being used
    config: {
      threshold: 100,
      signers: [
        {publicKey: edcsaSigner1.account.address, weight: 50},
        {publicKey: edcsaSigner2.account.address, weight: 50},
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
};
