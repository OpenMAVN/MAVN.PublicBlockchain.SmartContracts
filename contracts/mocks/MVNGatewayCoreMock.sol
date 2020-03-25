pragma solidity 0.5.12;

import "../MVNGatewayCore.sol";

contract MVNGatewayCoreMock is MVNGatewayCore {

    constructor(
        address mvnToken
    )
        public
        MVNGatewayCore(mvnToken)
    {
        
    }
    
    function onlyMVNTokenMock()
        public view
        onlyMVNToken
    {
        // solhint-disable-previous-line no-empty-blocks
    }

    function linkPublicAccount(
        address internalAccount,
        address publicAccount
    )
        external
    {
        _linkPublicAccount(internalAccount, publicAccount);
    }

    function setInternalSupply(
        uint256 newInternalSupply
    )
        external
    {
        _setInternalSupply(newInternalSupply);
    }

    function transferToInternalNetwork(
        address publicAccount,
        uint256 amount
    )
        external
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
    {
        _transferFromInternalNetwork(internalAccount, publicAccount, internalTransferId, amount);
    }

    function unlinkPublicAccount(
        address internalAccount
    )
        external
    {
        _unlinkPublicAccount(internalAccount);
    }
    
    // Causes a compilation error if super._removeBridge is not internal
    function _linkPublicAccount(
        address internalAccount,
        address publicAccount
    )
        internal
    {
        super._linkPublicAccount(internalAccount, publicAccount);
    }

    // Causes a compilation error if super._setTotalSupply is not internal
    function _setInternalSupply(
        uint256 newInternalSupply
    )
        internal
    {
        super._setInternalSupply(newInternalSupply);
    }

    // Causes a compilation error if super._transferToInternalNetwork is not internal
    function _transferToInternalNetwork(
        address publicAccount,
        uint256 amount
    )
        internal
    {
        super._transferToInternalNetwork(publicAccount, amount);
    }

    // Causes a compilation error if super._transferFromInternalNetwork is not internal
    function _transferFromInternalNetwork(
        address internalAccount,
        address publicAccount,
        uint256 internalTransferId,
        uint256 amount
    )
        internal
    {
        super._transferFromInternalNetwork(internalAccount, publicAccount, internalTransferId, amount);
    }

    // Causes a compilation error if super._unlinkPublicAccount is not internal
    function _unlinkPublicAccount(
        address internalAccount
    )
        internal
    {
        super._unlinkPublicAccount(internalAccount);
    }
}
