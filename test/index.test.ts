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
        gUSDC = gUSDC.connect(user);
        gAVAX = gAVAX.connect(user);
    });

    it('deposit USDC', async function () {
        const usdcAmount = ethers.utils.parseUnits('1000', USDC_DECIMAL);
        expect(await usdc.balanceOf(user.address)).to.eql(usdcAmount);

        const approveTx = await usdc.connect(user).approve(gUSDC.address, usdcAmount);
        await approveTx.wait();

        const mintTx = await gUSDC.mint(usdcAmount);
        await mintTx.wait();

        expect(await usdc.balanceOf(user.address)).to.eql(ethers.constants.Zero);
        expect(await gUSDC.balanceOf(user.address)).to.eql(usdcAmount);
    });

    it('deposit AVAX', async function () {
        const avaxAmount = ethers.utils.parseEther('1000');

        const mintTx = await gAVAX.mint({ value: avaxAmount });
        await mintTx.wait();

        expect(await gAVAX.balanceOf(user.address)).to.eql(avaxAmount);
    });

    it('redeem USDC', async function () {
        const amount100 = ethers.utils.parseUnits('100', USDC_DECIMAL);

        const redeemTx = await gUSDC.redeem(amount100);
        await redeemTx.wait();

        expect(await usdc.balanceOf(user.address)).to.eql(amount100);
        expect(await gUSDC.balanceOf(user.address)).to.eql(ethers.utils.parseUnits('900', USDC_DECIMAL));

        const redeemUnderlyingTx = await gUSDC.redeemUnderlying(amount100);
        await redeemUnderlyingTx.wait();

        expect(await usdc.balanceOf(user.address)).to.eql(ethers.utils.parseUnits('200', USDC_DECIMAL));
        expect(await gUSDC.balanceOf(user.address)).to.eql(ethers.utils.parseUnits('800', USDC_DECIMAL));
    });

    it('redeem AVAX', async function () {
        const oldBalance = await ethers.provider.getBalance(user.address);

        const redeemTx = await gAVAX.redeem(ethers.utils.parseEther('100'));
        const redeemRc = await redeemTx.wait();

        const newBalance = await ethers.provider.getBalance(user.address);
        const gasCost = redeemRc.gasUsed.mul(redeemRc.effectiveGasPrice);

        expect(newBalance.sub(oldBalance).add(gasCost)).to.eql(ethers.utils.parseEther('100'));
        expect(await gAVAX.balanceOf(user.address)).to.eql(ethers.utils.parseEther('900'));

        const redeemUnderlyingTx = await gAVAX.redeemUnderlying(ethers.utils.parseEther('100'));
        const redeemUnderlyingRc = await redeemUnderlyingTx.wait();

        const newBalance2 = await ethers.provider.getBalance(user.address);
        const gasCost2 = redeemUnderlyingRc.gasUsed.mul(redeemUnderlyingRc.effectiveGasPrice);

        expect(newBalance2.sub(newBalance).add(gasCost2)).to.eql(ethers.utils.parseEther('100'));
        expect(await gAVAX.balanceOf(user.address)).to.eql(ethers.utils.parseEther('800'));
    });

    it('check exchange rate after some blocks', async function () {});
    it('set collateral', async function () {});
    it('borrow', async function () {});
    it('check borrow amount after some blocks', async function () {});
    it('liquidate', async function () {});
});
