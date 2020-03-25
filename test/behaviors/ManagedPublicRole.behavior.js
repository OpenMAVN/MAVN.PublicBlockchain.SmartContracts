const { expectRevert, constants, expectEvent } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

function shouldBehaveLikeManagedPublicRole (owner, authorized, [other], rolename) {
    
    describe(`should behave like managed public ${rolename} role`, function() {
        
        beforeEach('check preconditions', async function () {
            expect(await this.contract[`is${rolename}`](owner)).to.equal(false);
            expect(await this.contract[`is${rolename}`](authorized)).to.equal(true);
            expect(await this.contract[`is${rolename}`](other)).to.equal(false);
        });

        it('reverts when querying roles for the null account', async function () {
            await expectRevert(
                this.contract[`is${rolename}`](ZERO_ADDRESS),
                `Roles: account is the zero address`
            );
        });

        describe('access control', function () {
            context('from authorized account', function () {
                it('allows access', async function () {
                    await this.contract[`only${rolename}Mock`]({ from: authorized });
                });
            });

            context('from unauthorized account', function () {
                it('reverts', async function () {
                    await expectRevert(this.contract[`only${rolename}Mock`]({ from: other }),
                        `${rolename}Role: caller does not have the ${rolename} role`
                    );
                });
            });
        });

        describe('add', function () {
            context(`from owner account`, function () {
                it('adds role to a new account', async function () {
                    await this.contract[`add${rolename}`](other, { from: owner });
                    expect(await this.contract[`is${rolename}`](other)).to.equal(true);
                });

                it(`emits a ${rolename}Added event`, async function () {
                    const { logs } = await this.contract[`add${rolename}`](other, { from: owner });
                    expectEvent.inLogs(logs, `${rolename}Added`, { account: other });
                });

                it('reverts when adding role to an already assigned account', async function () {
                    await expectRevert(this.contract[`add${rolename}`](authorized, { from: owner }),
                        'Roles: account already has role'
                    );
                });

                it('reverts when adding role to the null account', async function () {
                    await expectRevert(this.contract[`add${rolename}`](ZERO_ADDRESS, { from: owner }),
                        'Roles: account is the zero address'
                    );
                });
            });

            context(`from other account`, function () {
                it('reverts', async function () {
                    await expectRevert(this.contract[`add${rolename}`](other, { from: other }),
                        'Ownable: caller is not the owner'
                    );
                });
            });
        });

        describe('remove', function () {
            context(`from owner account`, function () {
                it('removes role from an already assigned account', async function () {
                    await this.contract[`remove${rolename}`](authorized, { from: owner });
                    expect(await this.contract[`is${rolename}`](authorized)).to.equal(false);
                });

                it(`emits a ${rolename}Removed event`, async function () {
                    const { logs } = await this.contract[`remove${rolename}`](authorized, { from: owner });
                    expectEvent.inLogs(logs, `${rolename}Removed`, { account: authorized });
                });

                it('reverts when removing from an unassigned account', async function () {
                    await expectRevert(this.contract[`remove${rolename}`](other, { from: owner }),
                        'Roles: account does not have role'
                    );
                });

                it('reverts when removing role from the null account', async function () {
                    await expectRevert(this.contract[`remove${rolename}`](ZERO_ADDRESS, { from: owner }),
                        'Roles: account is the zero address'
                    );
                });
            });
            
            context(`from other account`, function () {
                it('reverts', async function () {
                    await expectRevert(this.contract[`remove${rolename}`](authorized, { from: other }),
                        'Ownable: caller is not the owner'
                    );
                });
            });
        });

        describe('renouncing role', function () {
            it('renounces an assigned role', async function () {
                await this.contract[`renounce${rolename}`]({ from: authorized });
                expect(await this.contract[`is${rolename}`](authorized)).to.equal(false);
            });

            it(`emits a ${rolename}Removed event`, async function () {
                const { logs } = await this.contract[`renounce${rolename}`]({ from: authorized });
                expectEvent.inLogs(logs, `${rolename}Removed`, { account: authorized });
            });

            it('reverts when renouncing unassigned role', async function () {
                await expectRevert(this.contract[`renounce${rolename}`]({ from: other }),
                    'Roles: account does not have role'
                );
            });
        });
    });

}

module.exports = {
    shouldBehaveLikeManagedPublicRole,
};