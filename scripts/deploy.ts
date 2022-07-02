import assert from 'assert';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

interface gTokenInitArg {
    underlying_?: string;
    guptroller_: string;
    interestRateModel_: string;
    initialExchangeRateMantissa_: number;
    name_: string;
    symbol_: string;
    decimals_: number;
    admin_: string;
}

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

export async function deployPriceOracle() {
    // TODO: change this to use chainlink
    const priceOracleFactory = await ethers.getContractFactory('SimplePriceOracle');
    const priceOracle = await priceOracleFactory.deploy();
    await priceOracle.deployed();

    const mockPriceTx = await priceOracle.mockPrice();
    await mockPriceTx.wait();

    saveContractAddress('priceOracle', priceOracle.address);

    return priceOracle;
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

export async function deployGErc20(
    underlying_: string,
    guptroller_: string,
    interestRateModel_: string,
    initialExchangeRateMantissa_: number,
    name_: string,
    symbol_: string,
    decimals_: number,
    admin_: string,
    guptrollerDelegateCaller: Contract
) {
    const gErc20Factory = await ethers.getContractFactory('GErc20Immutable');
    const gErc20 = await gErc20Factory.deploy(
        underlying_,
        guptroller_,
        interestRateModel_,
        initialExchangeRateMantissa_,
        name_,
        symbol_,
        decimals_,
        admin_
    );
    await gErc20.deployed();

    const supportMarketTx = await guptrollerDelegateCaller._supportMarket(gErc20.address);
    await supportMarketTx.wait();

    saveContractAddress(symbol_, gErc20.address);

    return gErc20;
}

export async function deployGEther(
    guptroller_: string,
    interestRateModel_: string,
    initialExchangeRateMantissa_: number,
    name_: string,
    symbol_: string,
    decimals_: number,
    admin_: string,
    guptrollerDelegateCaller: Contract
) {
    const gEtherFactory = await ethers.getContractFactory('GEther');
    const gEther = await gEtherFactory.deploy(
        guptroller_,
        interestRateModel_,
        initialExchangeRateMantissa_,
        name_,
        symbol_,
        decimals_,
        admin_
    );

    const supportMarketTx = await guptrollerDelegateCaller._supportMarket(gEther.address);
    await supportMarketTx.wait();

    saveContractAddress(symbol_, gEther.address);

    return gEther;
}

export async function deployGToken(
    isEther: boolean = false,
    initArg: gTokenInitArg,
    collateralFactor: number,
    guptrollerDelegateCaller: Contract
) {
    let gTokenFactory, gToken;
    if (isEther) {
        gTokenFactory = await ethers.getContractFactory('GEther');
        gToken = await gTokenFactory.deploy(
            initArg.guptroller_,
            initArg.interestRateModel_,
            initArg.initialExchangeRateMantissa_,
            initArg.name_,
            initArg.symbol_,
            initArg.decimals_,
            initArg.admin_
        );
    } else {
        assert(initArg.underlying_);
        gTokenFactory = await ethers.getContractFactory('GErc20Immutable');
        gToken = await gTokenFactory.deploy(
            initArg.underlying_,
            initArg.guptroller_,
            initArg.interestRateModel_,
            initArg.initialExchangeRateMantissa_,
            initArg.name_,
            initArg.symbol_,
            initArg.decimals_,
            initArg.admin_
        );
    }
    await gToken.deployed();

    const supportMarketTx = await guptrollerDelegateCaller._supportMarket(gToken.address);
    await supportMarketTx.wait();

    const setCollaterFactorTx = await guptrollerDelegateCaller._setCollateralFactor(
        gToken.address,
        ethers.utils.parseEther(collateralFactor.toString())
    );
    await setCollaterFactorTx.wait();

    saveContractAddress(initArg.symbol_, gToken.address);

    return gToken;
}

export async function deployAll() {
    const [deployer] = await ethers.getSigners();
    const gup = await deployGup(deployer.address);
    const priceOracle = await deployPriceOracle();
    const guptroller = await deployGuptroller(gup.address);
    const interestRateModel = await deployInterestRateModel(0.05, 0.45, 5, 0.95, deployer.address);

    const guptrollerDelegateCaller = new Contract(
        guptroller.address,
        require('../artifacts/contracts/Guptroller.sol/Guptroller.json').abi,
        deployer
    );

    const setPriceOracleTx = await guptrollerDelegateCaller._setPriceOracle(priceOracle.address);
    await setPriceOracleTx.wait();

    const gUSDC = await deployGToken(
        false,
        {
            underlying_: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
            guptroller_: guptroller.address,
            interestRateModel_: interestRateModel.address,
            initialExchangeRateMantissa_: 1,
            name_: 'guppy USDC',
            symbol_: 'gUSDC',
            decimals_: 18,
            admin_: deployer.address
        },
        0.84,
        guptrollerDelegateCaller
    );

    const gAVAX = await deployGToken(
        true,
        {
            guptroller_: guptroller.address,
            interestRateModel_: interestRateModel.address,
            initialExchangeRateMantissa_: 1,
            name_: 'guppy AVAX',
            symbol_: 'gAVAX',
            decimals_: 18,
            admin_: deployer.address
        },
        0.825,
        guptrollerDelegateCaller
    );

    // params value ref: https://etherscan.io/address/0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b#readProxyContract
    const setCloseFactorTx = await guptrollerDelegateCaller._setCloseFactor(ethers.utils.parseEther('0.5'));
    await setCloseFactorTx.wait();

    const setLiquidationIncentiveTx = await guptrollerDelegateCaller._setLiquidationIncentive(
        ethers.utils.parseEther('1.08')
    );
    await setLiquidationIncentiveTx.wait();

    return {
        gup,
        priceOracle,
        guptroller,
        interestRateModel,
        guptrollerDelegateCaller,
        gUSDC,
        gAVAX
    };
}
