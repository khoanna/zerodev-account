import {toSudoPolicy} from "@zerodev/permissions/policies";
import {ParamCondition, toCallPolicy, CallPolicyVersion} from "@zerodev/permissions/policies";
import {toGasPolicy} from "@zerodev/permissions/policies";
import {parseEther} from "viem/utils";
import { toSignatureCallerPolicy } from "@zerodev/permissions/policies"
import { toRateLimitPolicy } from "@zerodev/permissions/policies"
import { toTimestampPolicy } from "@zerodev/permissions/policies"

// Sudo policy that allows all actions
export const sudoPolicy = toSudoPolicy({});

// Call policy example that restricts calls to specific contract functions
export const callPolicy = toCallPolicy({
  policyVersion: CallPolicyVersion.V0_0_4,
  permissions: [
    // {
    //   target: contractAddress,
    //   valueLimit: BigInt(0),
    //   abi: contractABI,
    //   functionName: "mint",
    //   args: [
    //     {
    //       condition: ParamCondition.EQUAL,
    //       value: value,
    //     },
    //   ],
    // },
  ],
});

// Gas policy that limits total gas usage
export const totalGasPolicy = toGasPolicy({
  allowed: parseEther("0.1"),
});

// Gas policy that enforces the use of a specific paymaster
export const enforcePaymasterGasPolicy = toGasPolicy({
  enforcePaymaster: true,
});

// Gas policy that allows only a specific paymaster
export const allowedPaymasterGasPolicy = toGasPolicy({
  allowedPaymaster: "0xPAYMASTER_ADDRESS",
});

// Signature caller policy that restricts which addresses can initiate transactions
export const signaturePolicy = toSignatureCallerPolicy({
  allowedCallers: ["0x1", "0x2"]
})

// Rate limit policy that restricts the number of actions within a time interval
export const rateLimitPolicy = toRateLimitPolicy({
  count: 1,
  interval: 60 * 60 * 24 * 30,
})

// Timestamp policy that defines a validity period for actions
export const timestampPolicy = toTimestampPolicy({
  validAfter: 1704085200,  
  validUntil: 1735707599,  
})