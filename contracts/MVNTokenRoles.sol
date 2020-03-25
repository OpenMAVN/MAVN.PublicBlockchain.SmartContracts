pragma solidity 0.5.12;

import "@openzeppelin/contracts/access/Roles.sol";
import "./ownership/NonRenounceableOwnable.sol";

contract MVNTokenRoles is NonRenounceableOwnable {
    using Roles for Roles.Role;

    Roles.Role private _blacklistAdmins;
    Roles.Role private _blacklisteds;
    Roles.Role private _pausers;
    Roles.Role private _seizers;
    
    event BlacklistAdminAdded(
        address indexed account
    );
    
    event BlacklistAdminRemoved(
        address indexed account
    );

    event BlacklistedAdded(
        address indexed account
    );
    
    event BlacklistedRemoved(
        address indexed account
    );

    event PauserAdded(
        address indexed account
    );
    
    event PauserRemoved(
        address indexed account
    );

    event SeizerAdded(
        address indexed account
    );

    event SeizerRemoved(
        address indexed account
    );

    constructor() 
        internal
    {
        
    }
    
    modifier onlyBlacklistAdmin() {
        require(isBlacklistAdmin(msg.sender), "BlacklistAdminRole: caller does not have the BlacklistAdmin role");
        _;
    }

    modifier onlySeizer() {
        require(isSeizer(msg.sender), "SeizerRole: caller does not have the Seizer role");
        _;
    }
    
    modifier onlyNotBlacklisted(address account) {
        require(!isBlacklisted(account), "BlacklistedRole: account has the Blacklisted role");
        _;
    }
    
    modifier onlyPauser() {
        require(isPauser(msg.sender), "PauserRole: caller does not have the Pauser role");
        _;
    }
    
    function addBlacklistAdmin(
        address account
    )
        external
        onlyOwner
    {
        _addBlacklistAdmin(account);
    }

    function addBlacklisted(
        address account
    )
        external
        onlyBlacklistAdmin 
    {
        _addBlacklisted(account);
    }
    
    function addPauser(
        address account
    )
        external
        onlyOwner
    {
        _addPauser(account);
    }

    function addSeizer(
        address account
    )
        external
        onlyOwner
    {
        _addSeizer(account);
    }

    function removeBlacklistAdmin(
        address account
    )
        external
        onlyOwner
    {
        _removeBlacklistAdmin(account);
    }

    function removeBlacklisted(
        address account
    )
        external
        onlyBlacklistAdmin
    {
        _removeBlacklisted(account);
    }
    
    function removePauser(
        address account
    )
        external
        onlyOwner
    {
        _removePauser(account);
    }

    function removeSeizer(
        address account
    )
        external
        onlyOwner
    {
        _removeSeizer(account);
    }

    function renounceBlacklistAdmin()
        external
    {
        _removeBlacklistAdmin(msg.sender);
    }
    
    function renouncePauser()
        external
    {
        _removePauser(msg.sender);
    }

    function renounceSeizer()
        external
    {
        _removeSeizer(msg.sender);
    }

    function isBlacklistAdmin(
        address account
    )
        public view 
        returns (bool) 
    {
        return _blacklistAdmins.has(account);
    }

    function isBlacklisted(
        address account
    )
        public view
        returns (bool)
    {
        return _blacklisteds.has(account);
    }

    function isPauser(
        address account
    )
        public view
        returns (bool) 
    {
        return _pausers.has(account);
    }

    function isSeizer(
        address account
    )
        public view
        returns (bool)
    {
        return _seizers.has(account);
    }
    
    function _addBlacklistAdmin(
        address account
    ) 
        internal 
    {
        _blacklistAdmins.add(account);
        
        emit BlacklistAdminAdded(account);
    }

    function _addBlacklisted(
        address account
    )
        internal
    {
        _blacklisteds.add(account);
        
        emit BlacklistedAdded(account);
    }
    
    function _addPauser(
        address account
    ) 
        internal 
    {
        _pausers.add(account);
        
        emit PauserAdded(account);
    }

    function _addSeizer(
        address account
    )
        internal
    {
        _seizers.add(account);

        emit SeizerAdded(account);
    }

    function _removeBlacklistAdmin(
        address account
    )
        internal
    {
        _blacklistAdmins.remove(account);
        
        emit BlacklistAdminRemoved(account);
    }

    function _removeBlacklisted(
        address account
    )
        internal
    {
        _blacklisteds.remove(account);
        
        emit BlacklistedRemoved(account);
    }
    
    function _removePauser(
        address account
    ) 
        internal 
    {
        _pausers.remove(account);
        
        emit PauserRemoved(account);
    }

    function _removeSeizer(
        address account
    )
        internal
    {
        _seizers.remove(account);

        emit SeizerRemoved(account);
    }
}
