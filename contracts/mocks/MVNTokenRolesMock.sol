pragma solidity 0.5.12;

import "../MVNTokenRoles.sol";

contract MVNTokenRolesMock is MVNTokenRoles {

    constructor()
        public
    {

    }
    
    function onlyBlacklistAdminMock()
        public view
        onlyBlacklistAdmin
    {
        // solhint-disable-previous-line no-empty-blocks
    }

    function onlyNotBlacklistedMock
    (
        address account
    )
        public view
        onlyNotBlacklisted(account)
    {
        // solhint-disable-previous-line no-empty-blocks
    }

    function onlyPauserMock()
        public view
        onlyPauser
    {
        // solhint-disable-previous-line no-empty-blocks
    }


    function onlySeizerMock()
        public view
        onlySeizer
    {
        // solhint-disable-previous-line no-empty-blocks
    }


    // Causes a compilation error if super._addBlacklistAdmin is not internal
    function _addBlacklistAdmin(
        address account
    )
        internal
    {
        super._addBlacklistAdmin(account);
    }

    // Causes a compilation error if super._addBlacklisted is not internal
    function _addBlacklisted(
        address account
    )
        internal
    {
        super._addBlacklisted(account);
    }

    // Causes a compilation error if super._addPauser is not internal
    function _addPauser(
        address account
    )
        internal
    {
        super._addPauser(account);
    }

    // Causes a compilation error if super._removeBlacklistAdmin is not internal
    function _removeBlacklistAdmin(
        address account
    )
        internal
    {
        super._removeBlacklistAdmin(account);
    }

    // Causes a compilation error if super._removeBlacklisted is not internal
    function _removeBlacklisted(
        address account
    )
        internal
    {
        super._removeBlacklisted(account);
    }
    
    // Causes a compilation error if super._removePauser is not internal
    function _removePauser(
        address account
    )
        internal
    {
        super._removePauser(account);
    }
}
