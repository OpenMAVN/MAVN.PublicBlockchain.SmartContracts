pragma solidity 0.5.12;

import "../MVNTokenCore.sol";

contract MVNTokenCoreMock is MVNTokenCore {

    constructor(
        address transitAccount
    )
        public
        MVNTokenCore(transitAccount)
    {
        
    }

    function onlyGatewayMock()
        public view
        onlyGateway
    {
        // solhint-disable-previous-line no-empty-blocks
    }

    function disableSeizingPermamently()
        external
    {
        _disableSeizingPermamently(msg.sender);
    }
    
    function pause()
        external
    {
        _pause(msg.sender);
    }

    function setGateway(
        address newGateway
    )
        external
    {
        _setGateway(newGateway);
    }

    function setInternalSupply(
        uint256 newInternalSupply
    )
        external
    {
        _setInternalSupply(newInternalSupply);
    }
    
    function transferToInternalNetwork(
        address sender,
        uint256 amount
    )
        external
    {
        _transferToInternalNetwork(sender, amount);
    }

    function unpause()
        external
    {
        _unpause(msg.sender);
    }

    function getInternalSupply()
        external view
        returns (uint256)
    {
        return _getInternalSupply();
    }

    // Causes a compilation error if super._pause is not internal
    function _disableSeizingPermamently(
        address account
    )
        internal
    {
        super._disableSeizingPermamently(account);
    }
    
    // Causes a compilation error if super._pause is not internal
    function _pause(
        address account
    )
        internal
    {
        super._pause(account);
    }

    // Causes a compilation error if super._setGateway is not internal
    function _setGateway(
        address newGateway
    )
        internal
    {
        super._setGateway(newGateway);
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
        address sender,
        uint256 amount
    )
        internal
    {
        super._transferToInternalNetwork(sender, amount);
    }

    // Causes a compilation error if super._unpause is not internal
    function _unpause(
        address account
    )
        internal
    {
        super._unpause(account);
    }

    // Causes a compilation error if super._getInternalSupply is not internal
    function _getInternalSupply()
        internal view
        returns (uint256)
    {
        return super._getInternalSupply();
    }
}
