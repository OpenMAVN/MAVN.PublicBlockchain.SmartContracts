pragma solidity 0.5.12;

interface IMVNToken {
    function mint(
        address account,
        uint256 amount
    ) external;
    
    function setInternalSupply(
        uint256 newInternalSupply
    ) external;
}
