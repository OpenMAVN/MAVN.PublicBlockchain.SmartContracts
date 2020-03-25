const { expectRevert } = require('@openzeppelin/test-helpers');

const MVNGatewayRolesMock = artifacts.require('MVNGatewayRolesMock');

const { shouldBehaveLikeNonRenouncableOwnable } = require('./behaviors/NonRenounceableOwnable.behavior');
const { shouldBehaveLikeManagedPublicRole } = require('./behaviors/ManagedPublicRole.behavior');

contract('MVNGatewayRoles', function ([_, owner, bridge, linker, other, ...otherAccounts]) {
    
    beforeEach(async function () {
        
        this.contract = await MVNGatewayRolesMock.new({ from: owner });

        await this.contract.addBridge(bridge, { from: owner });
        await this.contract.addLinker(linker, { from: owner });
        
    });

    shouldBehaveLikeNonRenouncableOwnable(owner, other);
    shouldBehaveLikeManagedPublicRole(owner, bridge, otherAccounts,'Bridge');
    shouldBehaveLikeManagedPublicRole(owner, linker, otherAccounts,'Linker');
    
});