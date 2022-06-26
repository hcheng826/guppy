# Guppy

Guppy is a project built on top of the Avalanche Platypus ecosystem. It allows the users who want to provide liquidity on Platypus to improve their captical efficiency. The deposited liquidity (stablecoins) can be served as collaterals and the user can borrow more stablecoins whlie the original deposited asset still earning rewards.

It builds on top of the Compound model with the improvement on capital efficiency. When the lender's money is not being borrowed, it does not just lie in the pool, instead it got deposited to Platypus booster (Vector, Echidna) to earn rewards.

## User Operations

- Deposit: Deposit stablecoins and mint gToken. gToken is like cToken whose value appreciates over time.
- Set collateral: Set the deposited asset as collaterals in order to borrow other assets.
- Borrow: User can borrow the asset it wants to borrow. The amount is limited by the collateral factor
- Liquidate: When the collateral value relative the debt value decrease to below the threshold, the borrowing position become liquidatable. Anyone can liquidate the position and get the collateral in discount.

## Concepts

- Borrow interest rate vs untilization: The higher the utilization, the higher the borrow interest rate. Note that borrow interest rate needs to be >= booster reward to be attractive to the lenders.
-
## Contract Structures

- gToken.sol
- Comptroller.sol

# Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by
Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your
Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the
deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/deploy.ts
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```

# Performance optimizations

For faster runs of your tests and scripts, consider skipping ts-node's type checking by setting the environment variable
`TS_NODE_TRANSPILE_ONLY` to `1` in hardhat's environment. For more details see
[the documentation](https://hardhat.org/guides/typescript.html#performance-optimizations).
