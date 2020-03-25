pragma solidity 0.5.12;

import "@openzeppelin/contracts/access/Roles.sol";
import "./ownership/NonRenounceableOwnable.sol";

contract MVNGatewayRoles is NonRenounceableOwnable {
    using Roles for Roles.Role;

    Roles.Role private _bridges;
    Roles.Role private _linkers;

    event BridgeAdded(
        address indexed account
    );

    event BridgeRemoved(
        address indexed account
    );
    
    event LinkerAdded(
        address indexed account
    );

    event LinkerRemoved(
        address indexed account
    );

    constructor()
        internal
    {
        
    }
    
    modifier onlyBridge() {
        require(isBridge(msg.sender), "BridgeRole: caller does not have the Bridge role");
        _;
    }
    
    modifier onlyLinker() {
        require(isLinker(msg.sender), "LinkerRole: caller does not have the Linker role");
        _;
    }

    function addBridge(
        address account
    )
        public
        onlyOwner
    {
        _addBridge(account);
    }
    
    function addLinker(
        address account
    )
        public
        onlyOwner
    {
        _addLinker(account);
    }

    function removeBridge(
        address account
    )
        public
        onlyOwner
    {
        _removeBridge(account);
    }

    function removeLinker(
        address account
    )
        public
        onlyOwner
    {
        _removeLinker(account);
    }

    function renounceBridge() 
        public
    {
        _removeBridge(msg.sender);
    }

    function renounceLinker()
        public
    {
        _removeLinker(msg.sender);
    }

    function isBridge(
        address account
    )
        public view
        returns (bool)
    {
        return _bridges.has(account);
    }
    
    function isLinker(
        address account
    )
        public view
        returns (bool)
    {
        return _linkers.has(account);
    }

    function _addBridge(
        address account
    )
        internal
    {
        _bridges.add(account);
        
        emit BridgeAdded(account);
    }

    function _addLinker(
        address account
    )
        internal
    {
        _linkers.add(account);

        emit LinkerAdded(account);
    }
    
    function _removeBridge(
        address account
    )
        internal
    {
        _bridges.remove(account);
        
        emit BridgeRemoved(account);
    }

    function _removeLinker(
        address account
    )
        internal
    {
        _linkers.remove(account);

        emit LinkerRemoved(account);
    }
}
