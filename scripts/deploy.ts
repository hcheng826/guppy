// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { showThrottleMessage } from '@ethersproject/providers';
import assert from 'assert';
import { ethers } from 'hardhat';

/*
async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy
    const Greeter = await ethers.getContractFactory('Greeter');
    const greeter = await Greeter.deploy('Hello, Hardhat!');

    await greeter.deployed();

    console.log('Greeter deployed to:', greeter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
*/

function saveContractAddress(contractName: string, address: string) {
    console.log(`${contractName} is deployed to: ${address}`);
}

export async function deployGup(adminAddr: string) {
    const gupFactory = await ethers.getContractFactory('Gup');
    const gup = await gupFactory.deploy(adminAddr);

    await gup.deployed();

    saveContractAddress('Gup', gup.address);

    return gup;
}

export async function deployGuptroller(gupAddr: string) {
    const unitrollerFactory = await ethers.getContractFactory('Unitroller');
    const unitroller = await unitrollerFactory.deploy(gupAddr);
    await unitroller.deployed();

    saveContractAddress('Unitroller', unitroller.address);

    const guptrollerFactory = await ethers.getContractFactory('Guptroller');
    const guptroller = await guptrollerFactory.deploy();
    await guptroller.deployed();

    saveContractAddress('Guptroller', guptroller.address);

    const setPendingImplementationTx = await unitroller._setPendingImplementation(guptroller.address);
    await setPendingImplementationTx.wait();

    const becomeTx = await guptroller._become(unitroller.address);
    await becomeTx.wait();

    assert((await unitroller.guptrollerImplementation()) === guptroller.address);

    // return proxy address
    return unitroller;
}

export async function deployInterestRateModel(
    baseRatePerYear: number,
    multiplierPerYear: number,
    jumpMultiplierPerYear: number,
    kink_: number,
    owner: string
) {
    const interestRateModelFactory = await ethers.getContractFactory('JumpRateModelV2');
    const interestRateModel = await interestRateModelFactory.deploy(
        ethers.utils.parseEther(baseRatePerYear.toString()),
        ethers.utils.parseEther(multiplierPerYear.toString()),
        ethers.utils.parseEther(jumpMultiplierPerYear.toString()),
        ethers.utils.parseEther(kink_.toString()),
        owner
    );
    await interestRateModel.deployed();

    saveContractAddress('InterestRateModel', interestRateModel.address);

    return interestRateModel;
}

export async function deployAll() {
    const [deployer] = await ethers.getSigners();
    const gup = await deployGup(deployer.address);
    const guptroller = await deployGuptroller(gup.address);
    const interestRateModel = await deployInterestRateModel(0.05, 0.45, 5, 0.95, deployer.address);
}
