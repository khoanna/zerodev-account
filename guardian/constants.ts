import { toFunctionSelector } from "viem"
 
export const recoveryExecutorAddress = '0xe884C2868CC82c16177eC73a93f7D9E6F3A5DC6E'
export const recoveryExecutorFunction = 'function doRecovery(address _validator, bytes calldata _data)'
export const recoveryExecutorSelector = toFunctionSelector(recoveryExecutorFunction)