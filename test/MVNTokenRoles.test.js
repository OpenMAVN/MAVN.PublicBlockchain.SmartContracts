const { expectRevert } = require('@openzeppelin/test-helpers');

const MVNTokenRolesMock = artifacts.require('MVNTokenRolesMock');

const { shouldBehaveLikeNonRenouncableOwnable } = require('./behaviors/NonRenounceableOwnable.behavior');
const { shouldBehaveLikeManagedPublicRole } = require('./behaviors/ManagedPublicRole.behavior');
const { shouldBehaveLikeBlacklistedRole } = require('./behaviors/BlacklistedRole.behavior');

const contractname = 'MVNTokenRoles';

contract(contractname, function ([_, owner, blacklistAdmin, blacklisted, pauser, seizer, other, ...otherAccounts]) {

    beforeEach(async function () {

        this.contract = await MVNTokenRolesMock.new({ from: owner });

        await this.contract.addBlacklistAdmin(blacklistAdmin, { from: owner });
        await this.contract.addBlacklisted(blacklisted, { from: blacklistAdmin });
        await this.contract.addPauser(pauser, { from: owner });
        await this.contract.addSeizer(seizer, { from: owner });
    });

    describe('renouncing ownership', function() {

        context('from owner account', function() {

            it('reverts', async function() {
                await expectRevert(this.contract['renounceOwnership']({ from: owner }),
                    'NonRenounceableOwnable: ownership can not be renounced'
                );
            });

        });

        context('from other account', function() {

            it('reverts', async function() {
                await expectRevert(this.contract['renounceOwnership']({ from: other }),
                    'Ownable: caller is not the owner'
                );
            });

        });

    });

    shouldBehaveLikeNonRenouncableOwnable(owner, other);
    shouldBehaveLikeManagedPublicRole(owner, blacklistAdmin, otherAccounts, 'BlacklistAdmin');
    shouldBehaveLikeManagedPublicRole(owner, pauser, otherAccounts, 'Pauser');
    shouldBehaveLikeManagedPublicRole(owner, seizer, otherAccounts, 'Seizer');
    shouldBehaveLikeBlacklistedRole(blacklistAdmin, blacklisted, otherAccounts);
});