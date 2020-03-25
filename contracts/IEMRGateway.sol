pragma solidity 0.5.12;

interface IMVNGateway {
    function transferToInternalNetwork(
        address publicAccount,
        uint256 amount
    ) external;
}
