const { expectRevert, constants, expectEvent } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const MVNGatewayMock = artifacts.require('MVNGatewayMock');
const MVNTokenCoreMock = artifacts.require('MVNTokenCoreMock');
const MVNTransitAccount = artifacts.require('MVNTransitAccount');

contract('MVNTokenCore', function ([_, owner, gateway, other, ...otherAccounts]) {

    beforeEach(async function () {

        this.transitAccount = await MVNTransitAccount.new({ from: owner });
        this.gateway = await MVNGatewayMock.new({ from: owner });
        this.contract = await MVNTokenCoreMock.new(this.transitAccount.address, { from: owner });

        expect(await this.contract['getInternalSupply']()).to.be.bignumber.equal('0');
        expect(await this.contract[`paused`]()).to.equal(false);
        expect(await this.contract[`gateway`]()).to.equal(ZERO_ADDRESS);
        expect(await this.contract['seizingPermamentlyDisabled']()).to.equal(false);
    });

    describe('deployment', function() {

        it('reverts when transitAccount is the zero address', async function () {
            await expectRevert(
                MVNTokenCoreMock.new(ZERO_ADDRESS, { from: owner }),
                'MVNTokenCore: transit account is the zero address'
            );
        });

    });
    
    describe('transit account', function() {
        
        it('transit account address is correct', async function() {
            expect(await this.contract[`transitAccount`]()).to.equal(this.transitAccount.address);
        });
        
        context('querying if account is a transit account', function() {

            context('for null account', function() {

                it('reverts', async function () {
                    await expectRevert(
                        this.contract['isTransitAccount'](ZERO_ADDRESS),
                        'MVNTokenCore: account is the zero address'
                    );
                });
                
            });

            context('for transit account', function() {

                it('returns true', async function() {
                    expect(await this.contract[`isTransitAccount`](this.transitAccount.address)).to.equal(true);
                });
                
            });

            context('for other account', function() {

                it('returns false', async function() {
                    expect(await this.contract[`isTransitAccount`](other)).to.equal(false);
                });
                
            });
        })
        
    });
    
    describe('access control', function() {
        
        context('Gateway role', function () {
            
            context('from Gateway', function() {
               
                it('allows access', async function() {
                    await this.contract['setGateway'](gateway);
                    await this.contract['onlyGatewayMock']({ from: gateway });
                });
                
            });

            context('from other account', function() {

                it('reverts', async function() {
                    await expectRevert(this.contract['onlyGatewayMock']({ from: other }),
                        'MVNTokenCore: caller is not the Gateway'
                    );
                });
                
            });
            
        })
        
    });
    
    describe('setting gateway', function() {

        it('changes gateway', async function() {
            await this.contract['setGateway'](gateway);
            expect(await this.contract[`gateway`]()).to.equal(gateway);
        });
        
        it('emits a GatewayChanged event', async function() {
            const { logs } = await this.contract['setGateway'](gateway);
            expectEvent.inLogs(logs, 'GatewayChanged', { previousGateway: ZERO_ADDRESS, newGateway: gateway });
        });
        
        it('reverts when setting gateway to the null account', async function() {
            await expectRevert(this.contract['setGateway'](ZERO_ADDRESS),
                'MVNTokenCore: new gateway address is the zero address'
            );
        });
        
    });

    describe('transferring to internal network', function() {

        it('triggers transfer to internal network', async function() {
            await this.contract['setGateway'](this.gateway.address);
            
            const { tx } = await this.contract['transferToInternalNetwork'](other, 42);
            await expectEvent.inTransaction(tx, MVNGatewayMock, 'TransferToInternalNetwork', {
                publicAccount: other,
                amount: '42'
            });
        });

        it('reverts when sender is null account', async function() {
            await this.contract['setGateway'](gateway);
            await expectRevert(this.contract['transferToInternalNetwork'](ZERO_ADDRESS, 42),
                'MVNTokenCore: sender address is the zero address'
            );
        });
        
        it('reverts when gateway is not set', async function() {
            await expectRevert(this.contract['transferToInternalNetwork'](other, 42),
                'MVNTokenCore: gateway address is not set'
            );
        });
        
    });

    describe('permamently disabling seizing', function() {
 
        it('marks tokens as non-seizable', async function() {
            await this.contract['disableSeizingPermamently']({ from: owner });
            expect(await this.contract['seizingPermamentlyDisabled']()).to.equal(true);
        });

        it('emits SeizingPermamentlyDisabled event', async function() {
            const { logs } = await this.contract['disableSeizingPermamently']({ from: owner });
            expectEvent.inLogs(logs, 'SeizingPermamentlyDisabled', { account: owner });
        });
        
    });
});