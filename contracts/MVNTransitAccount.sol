pragma solidity 0.5.12;

/**
 * @title Transit account for MAVN Utility Token
 * @notice Address of this contract instance should be used as a transit account address for MVN tokens.
 */
contract MVNTransitAccount {

    /**
     * @dev Returns the name of the contract.
     * @notice Intended to be used by Etherscan to correctly show contract name.
     */
    function name()
        external pure
        returns (string memory)
    {
        return "Transit account for MAVN Utility Token";
    }
    
}
