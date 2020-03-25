pragma solidity 0.5.12;

import "../MVNGateway.sol";

contract MVNTokenMock {
    address private _transitAccount;

    event Mint(
        address account,
        uint256 amount
    );
    
    event SetInternalSupply(
        uint256 internalSupply
    );
    
    constructor(
        address transitAccount
    )
        public
    {
        _transitAccount = transitAccount;
    }

    function mint(
        address account,
        uint256 amount
    )
        external
    {
        emit Mint(account, amount);
    }

    function setInternalSupply(
        uint256 newInternalSupply
    )
        external
    {
        emit SetInternalSupply(newInternalSupply);
    }

    function triggerTransferToInternalNetwork(
        address mvnGateway,
        address publicAccount,
        uint256 amount
    )
        external
    {
        MVNGateway(mvnGateway).transferToInternalNetwork(publicAccount, amount);
    }
}
