pragma solidity 0.5.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "./MVNTokenCore.sol";
import "./MVNTokenRoles.sol";

contract MVNToken is ERC20, ERC20Detailed, MVNTokenCore, MVNTokenRoles {
    
    event SeizeFrom (
        address indexed account,
        uint256 amount,
        string reason
    );
    
    constructor(
        address transitAccount
    ) 
        ERC20Detailed("MAVN Utility Token", "MVN", 18)
        MVNTokenCore(transitAccount)
        public
    {
        
    }

    function disableSeizingPermamently()
        external
        onlyOwner
    {
        _disableSeizingPermamently(msg.sender);
    }
    
    function mint(
        address account,
        uint256 amount
    )
        external
        onlyGateway
    {
        _mint(account, amount);
    }

    function pause()
        external
        onlyPauser
    {
        _pause(msg.sender);
    }

    function seizeFrom(
        address account,
        uint256 amount,
        string calldata reason
    )
        external
        onlySeizer
        whenSeizingNotDisabledPermamently
    {
        _burn(account, amount);

        emit SeizeFrom(account, amount, reason);
    }
    
    function setGateway(
        address account
    )
        external
        onlyOwner
    {
        _setGateway(account);
    }

    function unpause()
        external
        onlyPauser
    {
        _unpause(msg.sender);
    }
    
    function approve(
        address spender,
        uint256 value
    ) 
        public
        whenNotPaused
        onlyNotBlacklisted(msg.sender)
        onlyNotBlacklisted(spender)
        returns (bool)
    {
        return super.approve(spender, value);
    }

    function decreaseAllowance(
        address spender,
        uint subtractedValue
    ) 
        public
        whenNotPaused
        onlyNotBlacklisted(msg.sender)
        onlyNotBlacklisted(spender)
        returns (bool) 
    {
        return super.decreaseAllowance(spender, subtractedValue);
    }

    function increaseAllowance(
        address spender,
        uint addedValue
    )
        public
        whenNotPaused
        onlyNotBlacklisted(msg.sender)
        onlyNotBlacklisted(spender)
        returns (bool) 
    {
        return super.increaseAllowance(spender, addedValue);
    }
    
    function setInternalSupply(
        uint256 newInternalSupply
    )
        external
        onlyGateway
    {
        require(newInternalSupply >= publicSupply(), "MVNToken: public supply exceeds new internal supply");
        
        _setInternalSupply(newInternalSupply);
    }
    
    function transfer(
        address recipient,
        uint256 amount
    ) 
        public
        whenNotPaused
        onlyNotBlacklisted(msg.sender)
        onlyNotBlacklisted(recipient)
        returns (bool)
    {
        bool transferResult = super.transfer(recipient, amount);

        if (transferResult && isTransitAccount(recipient)) {
            _transferToInternalNetwork(msg.sender, amount);
            _burn(transitAccount(), amount);
        }

        return transferResult;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    )
        public
        whenNotPaused
        onlyNotBlacklisted(msg.sender)
        onlyNotBlacklisted(sender)
        onlyNotBlacklisted(recipient)
        returns (bool)
    {
        bool transferResult = super.transferFrom(sender, recipient, amount);

        if (transferResult && isTransitAccount(recipient)) {
            _transferToInternalNetwork(sender, amount);
            _burn(transitAccount(), amount);
        }
        
        return transferResult;
    }

    /**
     * Ethereum is a side chain for internal MAVN network.
     * All MVN tokens, that exist in Ethereum network, also exist in the internal MAVN network in a stacked state.
     * totalSupply() is overridden to reflect the actual supply of tokens, that is operable in both networks.
     * publicSupply() represents the actual supply of tokens, that is operable in Ethereum network.
     */
    
    function publicSupply()
        public view
        returns (uint256)
    {
        return ERC20.totalSupply();
    }
    
    function totalSupply()
        public view
        returns (uint256)
    {
        return _getInternalSupply();
    }
}
