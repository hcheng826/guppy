# Guppy

Guppy is a fish that has a different mechanism of breeding from other normal fish species. Just like Platypus and Echidna.

Guppy is a project built on top of the Avalanche Platypus ecosystem. It allows the users who want to provide liquidity on Platypus to improve their captical efficiency. The deposited liquidity (stablecoins) can be served as collaterals and the user can borrow more stablecoins whlie the original deposited asset still earning rewards.

It builds on top of the Compound model with the improvement on capital efficiency. When the lender's money is not being borrowed, it does not just lie in the pool, instead it got deposited to Platypus booster (Vector, Echidna) to earn rewards.

## Diagram
### Supply
![image](https://user-images.githubusercontent.com/23033847/177586308-845f292e-c62e-434c-af90-2722028721a8.png)
### Borrow
![image](https://user-images.githubusercontent.com/23033847/177586390-b4c51aa1-e330-4583-9705-4bc9714bdd25.png)


## User Operations

- Deposit: Deposit stablecoins and mint gToken. gToken is like cToken whose value appreciates over time.
- Redeem: Burn the gToken and get underlying token based on the exchange rate.
- Set collateral: Set the deposited asset as collaterals in order to borrow other assets.
- Borrow: User can borrow the asset it wants to borrow. The amount is limited by the collateral factor
- Liquidate: When the collateral value relative the debt value decrease to below the threshold, the borrowing position become liquidatable. Anyone can liquidate the position and get the collateral in discount.

## Deployment Process

### GUP Token

- Deploy `Gup` contract

### Price Oracle

- Deploy the oracle for Guptroller
### Guptroller

- Depoly `Unitroller` contract as proxy (Gup address is needed for constructor)
- Deploy `Guptroller` contract as implementation
- From `Unitroller` set pending implementation and accept it
- Set price oracle
- Set close factor, collateral factor, liquidation incentive

### Interest Rate Model

- Deploy `JumpRateModelV2` with the params
- ref1: https://github.com/compound-finance/compound-protocol/blob/a3214f67b73310d547e00fc578e8355911c9d376/tests/Tokens/cTokenTest.js#L70
- ref2: https://observablehq.com/@jflatow/compound-interest-rates

### gToken (gErc20 and gEther)

- Deploy `gErc20` and `gEther`
- Initialize with the contract with guptroller and interest rate model address
- Different token can have different interest rate model

### Set params
- Set close factor and liquidation incentive
## TODO

- [x] Write up deployment script
- [ ] Write test
- [ ] Integrate with Vector finance
    - [ ] deposit
    - [ ] redeem
    - [ ] claim reward
    - [ ] liquidation
- [ ] Tune interest rate model (borrow interest >= booster reward)
- [ ] Set up oracle using chainlink
- [ ] Governance token mechanism
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
