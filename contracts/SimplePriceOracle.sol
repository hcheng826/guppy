// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "./PriceOracle.sol";
import "./GErc20.sol";

contract SimplePriceOracle is PriceOracle {
    mapping(address => uint) prices;
    event PricePosted(address asset, uint previousPriceMantissa, uint requestedPriceMantissa, uint newPriceMantissa);

    function _getUnderlyingAddress(GToken gToken) private view returns (address) {
        address asset;
        if (compareStrings(gToken.symbol(), "gAVAX")) {
            asset = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
        } else {
            asset = address(GErc20(address(gToken)).underlying());
        }
        return asset;
    }

    function mockPrice() external {
        prices[0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE] = 17300000000000000000;
        prices[0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E] = 1000000;
        prices[0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7] = 1000000;
    }

    function getUnderlyingPrice(GToken gToken) public override view returns (uint) {
        return prices[_getUnderlyingAddress(gToken)];
    }

    function setUnderlyingPrice(GToken gToken, uint underlyingPriceMantissa) public {
        address asset = _getUnderlyingAddress(gToken);
        emit PricePosted(asset, prices[asset], underlyingPriceMantissa, underlyingPriceMantissa);
        prices[asset] = underlyingPriceMantissa;
    }

    function setDirectPrice(address asset, uint price) public {
        emit PricePosted(asset, prices[asset], price, price);
        prices[asset] = price;
    }

    // v1 price oracle interface for use as backing of proxy
    function assetPrices(address asset) external view returns (uint) {
        return prices[asset];
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}
