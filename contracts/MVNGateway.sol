pragma solidity 0.5.12;

import "./MVNGatewayCore.sol";
import "./MVNGatewayRoles.sol";

contract MVNGateway is MVNGatewayCore, MVNGatewayRoles {

    constructor(
        address mvnToken
    )
        MVNGatewayCore(mvnToken)
        public
    {
        
    }

    function linkPublicAccount(
        address internalAccount,
        address publicAccount
    )
        external
        onlyLinker
    {
        _linkPublicAccount(internalAccount, publicAccount);
    }

    function setInternalSupply(
        uint256 newInternalSupply
    )
        external
        onlyBridge
    {
        _setInternalSupply(newInternalSupply);
    }
    
    function transferToInternalNetwork(
        address publicAccount,
        uint256 amount
    )
        external
        onlyMVNToken
    {
        _transferToInternalNetwork(publicAccount, amount);
    }

    function transferFromInternalNetwork(
        address internalAccount,
        address publicAccount,
        uint256 internalTransferId,
        uint256 amount
    )
        external
        onlyBridge
    {
        _transferFromInternalNetwork(internalAccount, publicAccount, internalTransferId, amount);
    }

    function unlinkPublicAccount(
        address internalAccount
    )
        external
        onlyLinker
    {
        _unlinkPublicAccount(internalAccount);
    }

    function name()
        external pure
        returns (string memory)
    {
        return "Gateway for MAVN Utility Token";
    }
}
