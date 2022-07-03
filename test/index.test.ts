import { expect, use } from 'chai';
import { ethers } from 'hardhat';
import hre from 'hardhat';
import { deployAll } from '../scripts/deploy';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';

const USDC_DECIMAL = 6;

describe('Guppy', function () {
    let gup: Contract,
        priceOracle: Contract,
        guptroller: Contract,
        interestRateModel: Contract,
        guptrollerDelegateCaller: Contract,
        gUSDC: Contract,
        gAVAX: Contract;
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

        const transferAmount = ethers.utils.parseUnits('1000', USDC_DECIMAL);
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

    it('deposit USDC', async function () {
        const usdcAmount = ethers.utils.parseUnits('1000', USDC_DECIMAL);
        expect(await usdc.balanceOf(user.address)).to.eql(usdcAmount);

        const approveTx = await usdc.connect(user).approve(gUSDC.address, usdcAmount);
        await approveTx.wait();

        const mintTx = await gUSDC.connect(user).mint(usdcAmount);
        await mintTx.wait();

        expect(await usdc.balanceOf(user.address)).to.eql(ethers.constants.Zero);
        expect(await gUSDC.balanceOf(user.address)).to.eql(usdcAmount);
    });

    it('deposit AVAX', async function () {
        const avaxAmount = ethers.utils.parseEther('1000');

        const mintTx = await gAVAX.connect(user).mint({ value: avaxAmount });
        await mintTx.wait();

        expect(await gAVAX.balanceOf(user.address)).to.eql(avaxAmount);
    });

    it('redeem', async function () {});
    it('check exchange rate after some blocks', async function () {});
    it('set collateral', async function () {});
    it('borrow', async function () {});
    it('check borrow amount after some blocks', async function () {});
    it('liquidate', async function () {});
});
