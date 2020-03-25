pragma solidity 0.5.12;

import "./IMVNToken.sol";

contract MVNGatewayCore {
    address private _mvnToken;
    mapping(address => address) _internalAccounts;
    uint256 private _outgoingTransfersCount;
    mapping(address => address) _publicAccounts;
    mapping(uint256 => bool) _processedIncomingTransfers;

    event PublicAccountLinked(
        address indexed internalAccount,
        address indexed publicAccount
    );

    event PublicAccountUnlinked(
        address indexed internalAccount,
        address indexed publicAccount
    );

    event TransferredFromInternalNetwork(
        address indexed internalAccount,
        address indexed publicAccount,
        uint256 indexed internalTransferId,
        uint256 amount
    );

    event TransferredToInternalNetwork(
        address indexed publicAccount,
        address indexed internalAccount,
        uint256 indexed publicTransferId,
        uint256 amount
    );

    constructor(
        address mvnToken
    )
        internal
    {
        require(mvnToken != address(0), "MVNGatewayCore: mvnToken is the zero address");
        
        _mvnToken = mvnToken;
    }

    modifier onlyMVNToken() {
        require(msg.sender == _mvnToken, "MVNGatewayCore: caller is not the MVNToken");
        _;
    }
    
    function mvnToken()
        external view
        returns (address)
    {
        return _mvnToken;
    }

    function getInternalAccount(
        address publicAccount
    )
        public view
        returns (address)
    {
        require(publicAccount != address(0), "MVNGatewayCore: public account is the zero address");
        
        return _internalAccounts[publicAccount];
    }
    
    function getPublicAccount(
        address internalAccount
    )
        public view
        returns (address)
    {
        require(internalAccount != address(0), "MVNGatewayCore: internal account is the zero address");
        
        return _publicAccounts[internalAccount];
    }

    function _linkPublicAccount(
        address internalAccount,
        address publicAccount
    )
        internal
    {
        require(publicAccount != address(0), "MVNGatewayCore: public account is the zero address");
        
        if (getPublicAccount(internalAccount) != address(0)) {
            _unlinkPublicAccount(internalAccount);
        }

        _internalAccounts[publicAccount] = internalAccount;
        _publicAccounts[internalAccount] = publicAccount;

        emit PublicAccountLinked(internalAccount, publicAccount);
    }

    function _setInternalSupply(
        uint256 newInternalSupply
    )
        internal
    {
        IMVNToken(_mvnToken).setInternalSupply(newInternalSupply);
    }
    
    function _transferToInternalNetwork(
        address publicAccount,
        uint256 amount
    )
        internal
    {
        address internalAccount = getInternalAccount(publicAccount);

        require(internalAccount != address(0), "MVNGatewayCore: internal account is not linked");

        emit TransferredToInternalNetwork(publicAccount, internalAccount, _outgoingTransfersCount++, amount);
    }

    function _transferFromInternalNetwork(
        address internalAccount,
        address publicAccount,
        uint256 internalTransferId,
        uint256 amount
    )
        internal
    {
        require(internalAccount != address(0), "MVNGatewayCore: internal account is the zero address");
        require(publicAccount != address(0), "MVNGatewayCore: public account is the zero address");
        require(!_processedIncomingTransfers[internalTransferId], "MVNGatewayCore: incoming transfer has already been processed");
        
        IMVNToken(_mvnToken).mint(publicAccount, amount);
        
        emit TransferredFromInternalNetwork(internalAccount, publicAccount, internalTransferId, amount);

        _processedIncomingTransfers[internalTransferId] = true;
    }

    function _unlinkPublicAccount(
        address internalAccount
    )
        internal
    {
        address publicAccount = getPublicAccount(internalAccount);

        require(publicAccount != address(0), "MVNGatewayCore: public account is not linked");
        
        _internalAccounts[publicAccount] = address(0);
        _publicAccounts[internalAccount] = address(0);

        emit PublicAccountUnlinked(internalAccount, publicAccount);
    }
}
