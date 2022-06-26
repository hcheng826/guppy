// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

abstract contract GuptrollerInterface {
    /// @notice Indicator that this is a Guptroller contract (for inspection)
    bool public constant isGuptroller = true;

    /*** Assets You Are In ***/

    function enterMarkets(address[] calldata gTokens) virtual external returns (uint[] memory);
    function exitMarket(address gToken) virtual external returns (uint);

    /*** Policy Hooks ***/

    function mintAllowed(address gToken, address minter, uint mintAmount) virtual external returns (uint);
    function mintVerify(address gToken, address minter, uint mintAmount, uint mintTokens) virtual external;

    function redeemAllowed(address gToken, address redeemer, uint redeemTokens) virtual external returns (uint);
    function redeemVerify(address gToken, address redeemer, uint redeemAmount, uint redeemTokens) virtual external;

    function borrowAllowed(address gToken, address borrower, uint borrowAmount) virtual external returns (uint);
    function borrowVerify(address gToken, address borrower, uint borrowAmount) virtual external;

    function repayBorrowAllowed(
        address gToken,
        address payer,
        address borrower,
        uint repayAmount) virtual external returns (uint);
    function repayBorrowVerify(
        address gToken,
        address payer,
        address borrower,
        uint repayAmount,
        uint borrowerIndex) virtual external;

    function liquidateBorrowAllowed(
        address gTokenBorrowed,
        address gTokenCollateral,
        address liquidator,
        address borrower,
        uint repayAmount) virtual external returns (uint);
    function liquidateBorrowVerify(
        address gTokenBorrowed,
        address gTokenCollateral,
        address liquidator,
        address borrower,
        uint repayAmount,
        uint seizeTokens) virtual external;

    function seizeAllowed(
        address gTokenCollateral,
        address gTokenBorrowed,
        address liquidator,
        address borrower,
        uint seizeTokens) virtual external returns (uint);
    function seizeVerify(
        address gTokenCollateral,
        address gTokenBorrowed,
        address liquidator,
        address borrower,
        uint seizeTokens) virtual external;

    function transferAllowed(address gToken, address src, address dst, uint transferTokens) virtual external returns (uint);
    function transferVerify(address gToken, address src, address dst, uint transferTokens) virtual external;

    /*** Liquidity/Liquidation Calculations ***/

    function liquidateCalculateSeizeTokens(
        address gTokenBorrowed,
        address gTokenCollateral,
        uint repayAmount) virtual external view returns (uint, uint);
}
