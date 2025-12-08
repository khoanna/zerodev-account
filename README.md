# ZeroDev Smart Account Examples

A comprehensive collection of example implementations demonstrating ZeroDev's smart account capabilities.

ZeroDev is the most powerful smart account solution, powering more than 6 million smart accounts across 50+ networks. These examples show you how to leverage key abstraction, gas abstraction, transaction abstraction, and chain abstraction to build superior Web3 experiences.

## ✨ What You Can Do With ZeroDev

### Key Abstraction
- Login with passkeys or social accounts
- Recover user accounts if they lose their login

### Gas Abstraction
- Sponsor gas fees for your users
- Let users pay gas with ERC20 tokens instead of ETH

### Transaction Abstraction
- Batch multiple transactions into one user operation
- No more tedious approve-then-spend flows

### Permissions & Automation
- Create session keys with fine-grained policies
- Automate transactions for AI agents and bots

### Chain Abstraction
- Spend tokens on any chain without bridging
- On/offramp with any exchanges on L2s

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- A Sepolia testnet account with some ETH for testing
- A ZeroDev API key from [dashboard.zerodev.app](https://dashboard.zerodev.app)

### Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   ZERODEV_RPC=https://rpc.zerodev.app/api/v1/rpc/{CHAIN_ID}?apikey={YOUR_API_KEY}
   PRIVATE_KEY=your_private_key_here
   GUARDIAN_KEY=your_guardian_private_key_here
   ```

3. **Run an example:**
   ```bash
   npx ts-node create-account/create-account.ts
   ```

## 📚 Examples

### Core Account Management

#### 1. **Create Account** 
[`create-account/create-account.ts`](create-account/create-account.ts)

Create a Kernel account with ECDSA validation—the foundation for all smart account operations.

```bash
npx ts-node create-account/create-account.ts
```

#### 2. **Send Transactions**
[`send-transaction/`](send-transaction)

- **[send-tx.ts](send-transaction/send-tx.ts)** - Send regular transactions
- **[send-userOp.ts](send-transaction/send-userOp.ts)** - Send user operations through the bundler for sponsorship

```bash
npx ts-node send-transaction/send-userOp.ts
```

### Advanced Features

#### 3. **Session Keys & Permissions**
[`session-keys/`](session-keys)

Create delegated session keys with fine-grained access control—perfect for apps and agents.

- **[create-session-key.ts](session-keys/create-session-key.ts)** - Generate a new session key
- **[approve-session-keys.ts](session-keys/approve-session-keys.ts)** - Approve and revoke session keys
- **[policy.ts](session-keys/policy.ts)** - Define policies: gas limits, call restrictions, rate limits, timeouts

```bash
npx ts-node session-keys/create-session-key.ts
```

#### 4. **Batch Transactions**
[`batching-transaction/index.ts`](batching-transaction)

Execute multiple transactions in a single user operation.

#### 5. **Validate Signatures**
[`validate-signature/validate-signature.ts`](validate-signature)

Verify EIP-6492 signatures for smart accounts off-chain.

```bash
npx ts-node validate-signature/validate-signature.ts
```

#### 6. **Guardian Recovery**
[`guardian/`](guardian)

Implement account recovery using trusted guardians.

```bash
npx ts-node guardian/index.ts
```

#### 7. **Spending Limits with Hooks**
[`hooks/`](hooks)

Use account hooks to enforce spending limits on token transfers.

```bash
npx ts-node hooks/index.ts
```

### Deployment & Integration

#### 8. **Deploy Contracts**
[`deploy-contract/index.ts`](deploy-contract)

Deploy smart contracts using your Kernel account.

```bash
npx ts-node deploy-contract/index.ts
```

#### 9. **DelegateCall Execution**
[`delegatecall/index.ts`](delegatecall)

Execute operations using delegatecall for advanced scenarios.

#### 10. **Fallback Bundlers**
[`fallback/index.ts`](fallback)

Implement fallback logic across multiple bundler providers for reliability.

#### 11. **Remote Signer**
[`remote-signer/index.ts`](remote-signer)

Use ZeroDev's remote signer for key management and KMS integration.

#### 12. **Account Migration**
[`migration-account/index.ts`](migration-account)

Migrate accounts between different Kernel versions.

#### 13. **Emit Events**
[`emit-event-when-creating-account/index.ts`](emit-event-when-creating-account)

Emit custom events during account creation for tracking and analytics.

## 🏗️ Project Structure

```
zerodev-account/
├── config/                          # Shared configuration
├── create-account/                  # Account creation examples
├── deploy-contract/                 # Contract deployment
├── send-transaction/                # Transaction sending
├── session-keys/                    # Session key management
├── validate-signature/              # Signature validation
├── hooks/                           # Account hooks & policies
├── guardian/                        # Account recovery
├── delegatecall/                    # DelegateCall patterns
├── fallback/                        # Fallback bundlers
├── batching-transaction/            # Batch operations
├── remote-signer/                   # Remote key management
├── migration-account/               # Account migration
├── emit-event-when-creating-account/# Event emission
├── package.json
├── tsconfig.json
└── README.md
```

## 🔑 Key Concepts

### Kernel Accounts
ZeroDev's Kernel is a modular smart contract account that supports multiple plugins and validators for flexible, extensible account management.

### ECDSA Validator
The default validator plugin that uses ECDSA signatures to authorize transactions. Perfect for key abstraction.

### Paymasters
Sponsored transaction execution. Configure your paymaster at [dashboard.zerodev.app](https://dashboard.zerodev.app) and deposit ETH to sponsor user operations for your users.

### Plugins
Extend Kernel account functionality:
- **Sudo Plugin** - Main validator and authentication
- **Regular Plugins** - Secondary functionality (permissions, etc.)
- **Hooks** - Execution hooks (spending limits, validation logic)
- **Actions** - Custom actions (recovery, notifications, etc.)

### User Operations (ERC-4337)
Standardized operations submitted through a bundler instead of direct RPC. This enables:
- Gas sponsorship via paymasters
- Transaction batching
- Account abstraction benefits

### Session Keys
Delegated keys with scoped permissions. Perfect for:
- AI agents and automation
- App integrations
- Temporarily granting access without compromising the main account

## 🌐 Supported Networks

ZeroDev works on 50+ networks including:
- Ethereum Mainnet & Sepolia
- Polygon, Optimism, Arbitrum
- Base, Linea, and many more

Check the [docs](https://docs.zerodev.app/) for the complete list.

## 📖 Learn More

- **[Official Documentation](https://docs.zerodev.app/)** - Complete SDK reference and guides
- **[Quickstart](https://docs.zerodev.app/sdk/getting-started/quickstart)** - Get up and running in minutes
- **[Tutorial](https://docs.zerodev.app/sdk/getting-started/tutorial)** - Step-by-step learning
- **[Dashboard](https://dashboard.zerodev.app/)** - Manage your API keys and paymasters
- **[Blog](https://docs.zerodev.app/blog)** - Latest updates and announcements

## 💬 Support

Have questions? Reach out on [Telegram](https://t.me/derek_chiang) or check the [docs](https://docs.zerodev.app/).

## 📄 License

ISC
