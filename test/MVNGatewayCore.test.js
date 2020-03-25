const { expectRevert, constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const MVNGatewayCoreMock = artifacts.require('MVNGatewayCoreMock');
const MVNTokenMock = artifacts.require('MVNTokenMock');
const MVNTransitAccount = artifacts.require('MVNTransitAccount');

contract('MVNGatewayCore', function ([_, owner, other]) {

    beforeEach(async function () {

        this.transitAccount = await MVNTransitAccount.new({ from: owner });
        this.mvnToken = await MVNTokenMock.new(this.transitAccount.address, { from: owner });
        this.contract = await MVNGatewayCoreMock.new(this.mvnToken.address, { from: owner });

        expect(await this.contract['mvnToken']()).to.equal(this.mvnToken.address);
    });

    it('reverts when querying public account for the null account', async function () {
        await expectRevert(
            this.contract['getPublicAccount'](ZERO_ADDRESS),
            'MVNGatewayCore: internal account is the zero address'
        );
    });

    it('reverts when querying internal account for the null account', async function () {
        await expectRevert(
            this.contract['getInternalAccount'](ZERO_ADDRESS),
            'MVNGatewayCore: public account is the zero address'
        );
    });

    describe('deployment', function() {

        it('reverts when mvnToken is the zero address', async function () {
            await expectRevert(
                MVNGatewayCoreMock.new(ZERO_ADDRESS, { from: owner }),
                'MVNGatewayCore: mvnToken is the zero address'
            );
        });    
        
    });
    
    describe('access control', function() {
        
        context('MVNToken role', function() {

            context('from MVNToken', function() {
                
                it('allows access', async function() {
                    this.contract['onlyMVNTokenMock']({ from: this.mvnToken.address });
                });
                
            });

            context('for other account', function() {
                
                it('reverts', async function() {
                    await expectRevert(this.contract['onlyMVNTokenMock']({ from: other }),
                        'MVNGatewayCore: caller is not the MVNToken'
                    );
                });
                
            });
            
        });
        
    });
});

