pragma solidity 0.5.12;

import "../MVNGatewayRoles.sol";

contract MVNGatewayRolesMock is MVNGatewayRoles {
   
    function onlyBridgeMock() 
        public view
        onlyBridge 
    {
        // solhint-disable-previous-line no-empty-blocks
    }

    function onlyLinkerMock()
        public view
        onlyLinker
    {
        // solhint-disable-previous-line no-empty-blocks
    }

    
    // Causes a compilation error if super._removeBridge is not internal
    function _removeBridge(
        address account
    )
        internal 
    {
        super._removeBridge(account);
    }

    // Causes a compilation error if super._removeBridge is not internal
    function _removeLinker(
        address account
    )
        internal
    {
        super._removeLinker(account);
    }
}
