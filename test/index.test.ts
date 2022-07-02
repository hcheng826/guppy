import { expect } from 'chai';
import { ethers } from 'hardhat';
import hre from 'hardhat';
import { deployAll } from '../scripts/deploy';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';

describe('Guppy', function () {
    let gup, priceOracle, guptroller, interestRateModel, guptrollerDelegateCaller, gUSDC, gAVAX;
    let deployer: SignerWithAddress, user: SignerWithAddress;
    let usdc: Contract;

    before(async function () {
        [deployer, user] = await ethers.getSigners();

        await hre.network.provider.request({
            method: 'hardhat_impersonateAccount',
            params: ['0x42d6Ce661bB2e5F5cc639E7BEFE74Ff9Fd649541'] // big USDC holder
        });

        const impersonatedSigner = await ethers.getSigner('0x42d6Ce661bB2e5F5cc639E7BEFE74Ff9Fd649541');
        usdc = await ethers.getContractAtFromArtifact(
            require('../artifacts/contracts/EIP20Interface.sol/EIP20Interface.json'),
            '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC contract address
            impersonatedSigner
        );

        const transferAmount = 1000 * 1e6;
        const transferUsdcTx = await usdc.connect(impersonatedSigner).transfer(user.address, transferAmount);
        await transferUsdcTx.wait();

        await hre.network.provider.request({
            method: 'hardhat_stopImpersonatingAccount',
            params: ['0x42d6Ce661bB2e5F5cc639E7BEFE74Ff9Fd649541']
        });
    });

    it('deployment', async function () {
        ({ gup, priceOracle, guptroller, interestRateModel, guptrollerDelegateCaller, gUSDC, gAVAX } =
            await deployAll());
    });

    it('deposit', async function () {
        expect(await usdc.balanceOf(user.address)).to.eql(ethers.BigNumber.from(1000 * 1e6));
    });
    it('redeem', async function () {});
    it('set collateral', async function () {});
    it('borrow', async function () {});
    it('liquidate', async function () {});
});
