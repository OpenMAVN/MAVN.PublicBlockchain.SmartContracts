pragma solidity 0.5.12;

import "./IMVNGateway.sol";

contract MVNTokenCore {
    address private _gateway;
    uint256 private _internalSupply;
    bool private _paused;
    address private _transitAccount;
    bool private _seizingPermamentlyDisabled;

    event GatewayChanged(
        address indexed previousGateway,
        address indexed newGateway
    );

    event InternalSupplyChanged(
        uint256 previousInternalSupply,
        uint256 newInternalSupply
    );
    
    event SeizingPermamentlyDisabled(
        address indexed account
    );
    
    event Paused(
        address indexed account
    );
    
    event Unpaused(
        address indexed account
    );

    constructor(
        address transitAccount
    )
        internal
    {
        require(transitAccount != address(0), "MVNTokenCore: transit account is the zero address");

        _transitAccount = transitAccount;
    }

    modifier onlyGateway() {
        require(msg.sender == _gateway, "MVNTokenCore: caller is not the Gateway");
        _;
    }

    modifier whenSeizingNotDisabledPermamently() {
        require(!_seizingPermamentlyDisabled, "MVNTokenCore: seizing is permamently disabled");
        _;
    }
    
    modifier whenNotPaused() {
        require(!_paused, "MVNTokenCore: paused");
        _;
    }

    modifier whenPaused() {
        require(_paused, "MVNTokenCore: not paused");
        _;
    }

    function gateway()
        external view
        returns (address)
    {
        return _gateway;
    }

    function paused()
        external view
        returns (bool)
    {
        return _paused;
    }

    function isTransitAccount(
        address account
    )
        public view
        returns (bool)
    {
        require(account != address(0), "MVNTokenCore: account is the zero address");
        
        return account == _transitAccount;
    }

    function seizingPermamentlyDisabled()
        public view
        returns (bool)
    {
        return _seizingPermamentlyDisabled;
    }
    
    function transitAccount()
        public view
        returns (address)
    {
        return _transitAccount;
    }

    function _disableSeizingPermamently(
        address account
    )
        internal
        whenSeizingNotDisabledPermamently
    {
        _seizingPermamentlyDisabled = true;
        
        emit SeizingPermamentlyDisabled(account);
    }
    
    function _pause(
        address account
    )
        internal
        whenNotPaused
    {
        _paused = true;

        emit Paused(account);
    }

    function _setGateway(
        address newGateway
    )
        internal
    {
        require(newGateway != address(0), "MVNTokenCore: new gateway address is the zero address");
        
        emit GatewayChanged(_gateway, newGateway);
        
        _gateway = newGateway;
    }

    function _setInternalSupply(
        uint256 newInternalSupply
    )
        internal
    {
        emit InternalSupplyChanged(_internalSupply, newInternalSupply);

        _internalSupply = newInternalSupply;
    }
    
    function _transferToInternalNetwork(
        address sender,
        uint256 amount
    )
        internal
    {
        require(sender != address(0), "MVNTokenCore: sender address is the zero address");
        require(_gateway != address(0), "MVNTokenCore: gateway address is not set");

        IMVNGateway(_gateway).transferToInternalNetwork(sender, amount);
    }

    function _unpause(
        address account
    )
        internal
        whenPaused
    {
        _paused = false;

        emit Unpaused(account);
    }

    function _getInternalSupply()
        internal view
        returns (uint256)
    {
        return _internalSupply;
    }
}