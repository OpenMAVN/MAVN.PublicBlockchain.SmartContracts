const { expectRevert, constants, expectEvent } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

function shouldBehaveLikeBlacklistedRole(blacklistAdmin, blacklisted, [other]) {

    describe('should behave like managed public Blacklisted role', function() {

        beforeEach(async function () {
            expect(await this.contract[`isBlacklisted`](blacklisted)).to.equal(true);
            expect(await this.contract[`isBlacklisted`](other)).to.equal(false);
        });
        
        it('reverts when querying roles for the null account', async function () {
            await expectRevert(
                this.contract[`isBlacklisted`](ZERO_ADDRESS),
                `Roles: account is the zero address`
            );
        });
        
        describe('access control', function () {
            context('for blacklisted account', function () {
                it('reverts', async function () {
                    await expectRevert(this.contract[`onlyNotBlacklistedMock`](blacklisted),
                        `BlacklistedRole: account has the Blacklisted role`
                    );
                });
            });

            context('for non-blacklisted account', function () {
                it('allows access', async function () {
                    await this.contract[`onlyNotBlacklistedMock`](other);
                });
            });
        });

        describe('add', function () {
            context(`from blacklist admin account`, function () {
                it('adds role to a new account', async function () {
                    await this.contract[`addBlacklisted`](other, { from: blacklistAdmin });
                    expect(await this.contract[`isBlacklisted`](other)).to.equal(true);
                });

                it(`emits a BlacklistedAdded event`, async function () {
                    const { logs } = await this.contract[`addBlacklisted`](other, { from: blacklistAdmin });
                    expectEvent.inLogs(logs, `BlacklistedAdded`, { account: other });
                });

                it('reverts when adding role to an already assigned account', async function () {
                    await expectRevert(this.contract[`addBlacklisted`](blacklisted, { from: blacklistAdmin }),
                        'Roles: account already has role'
                    );
                });

                it('reverts when adding role to the null account', async function () {
                    await expectRevert(this.contract[`addBlacklisted`](ZERO_ADDRESS, { from: blacklistAdmin }),
                        'Roles: account is the zero address'
                    );
                });
            });

            context(`from other account`, function () {
                it('reverts', async function () {
                    await expectRevert(this.contract[`addBlacklisted`](other, { from: other }),
                        'BlacklistAdminRole: caller does not have the BlacklistAdmin role'
                    );
                });
            });
        });

        describe('remove', function () {
            context(`from blacklist admin account`, function () {
                it('removes role from an already assigned account', async function () {
                    await this.contract[`removeBlacklisted`](blacklisted, { from: blacklistAdmin });
                    expect(await this.contract[`isBlacklisted`](blacklisted)).to.equal(false);
                });

                it(`emits a BlacklistedRemoved event`, async function () {
                    const { logs } = await this.contract[`removeBlacklisted`](blacklisted, { from: blacklistAdmin });
                    expectEvent.inLogs(logs, `BlacklistedRemoved`, { account: blacklisted });
                });

                it('reverts when removing from an unassigned account', async function () {
                    await expectRevert(this.contract[`removeBlacklisted`](other, { from: blacklistAdmin }),
                        'Roles: account does not have role'
                    );
                });

                it('reverts when removing role from the null account', async function () {
                    await expectRevert(this.contract[`removeBlacklisted`](ZERO_ADDRESS, { from: blacklistAdmin }),
                        'Roles: account is the zero address'
                    );
                });
            });

            context(`from other account`, function () {
                it('reverts', async function () {
                    await expectRevert(this.contract[`removeBlacklisted`](blacklisted, { from: other }),
                        'BlacklistAdminRole: caller does not have the BlacklistAdmin role'
                    );
                });
            });
        });
        
    });
    
}

module.exports = {
    shouldBehaveLikeBlacklistedRole,
};