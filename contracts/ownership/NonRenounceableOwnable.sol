pragma solidity 0.5.12;

import "@openzeppelin/contracts/ownership/Ownable.sol";

contract NonRenounceableOwnable is Ownable {

    constructor ()
        internal 
    {
        
    }

    /**
     * @dev Prevents ownership renouncing.
     */
    function renounceOwnership()
        public
        onlyOwner
    {
        revert('NonRenounceableOwnable: ownership can not be renounced');
    }
}