pragma solidity 0.5.12;

contract MVNGatewayMock {
    
    event TransferToInternalNetwork(
        address publicAccount,
        uint256 amount
    );
    
    function transferToInternalNetwork(
        address publicAccount,
        uint256 amount
    )
        external
    {
        emit TransferToInternalNetwork(publicAccount, amount);
    }
}
