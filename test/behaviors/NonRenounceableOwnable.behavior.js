const { expectRevert } = require('@openzeppelin/test-helpers');

function shouldBehaveLikeNonRenouncableOwnable(owner, other) {

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
    
}

module.exports = {
    shouldBehaveLikeNonRenouncableOwnable
};