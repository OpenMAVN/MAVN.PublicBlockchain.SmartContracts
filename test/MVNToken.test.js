const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const MVNGatewayMock = artifacts.require('MVNGatewayMock');
const MVNToken = artifacts.require('MVNToken');
const MVNTransitAccount = artifacts.require('MVNTransitAccount');

contract('MVNToken', function ([_, owner, gateway, pauser, blacklistAdmin, seizer, other, ...otherAccounts]) {

    beforeEach(async function () {

        this.transitAccount = await MVNTransitAccount.new({ from: owner });
        this.gateway = await MVNGatewayMock.new({ from: owner });
        this.contract = await MVNToken.new(this.transitAccount.address, { from: owner });

        await this.contract.addPauser(pauser, { from: owner });
        await this.contract.addBlacklistAdmin(blacklistAdmin, { from: owner });
        await this.contract.addSeizer(seizer, { from: owner });
        
    });

    it('has correct name', async function() {
        expect(await this.contract['name']()).to.equal('MAVN Utility Token');
    });

    it('has correct symbol', async function() {
        expect(await this.contract['symbol']()).to.equal('MVN');
    });

    it('has correct number of decimals', async function() {
        expect(await this.contract['decimals']()).to.be.bignumber.equal('18');
    });
    
    describe('minting', function() {

        context('from gateway account', function() {

            it('increases public supply', async function() {
                await this.contract['setGateway'](gateway, { from: owner });
                await this.contract['mint'](other, 42, { from: gateway });
                expect(await this.contract['publicSupply']()).to.be.bignumber.equal('42');
            });

            it('does not affect total supply', async function() {
                await this.contract['setGateway'](gateway, { from: owner });
                await this.contract['mint'](other, 42, { from: gateway });
                expect(await this.contract['totalSupply']()).to.be.bignumber.equal('0');
            });

        });
        
        context('from other account', function() {

            it('reverts', async function() {
                await this.contract['setGateway'](gateway, { from: owner });
                await expectRevert(
                    this.contract['mint'](other, 42, { from: other }),
                    'MVNTokenCore: caller is not the Gateway'
                );
            });
            
        });
        
    });

    describe('pausing', function() {

        context('from pauser account', function() {

            context('when paused', function() {

                it('reverts', async function() {
                    await this.contract['pause']({ from: pauser });
                    await expectRevert(this.contract['pause']({ from: pauser }),
                        'MVNTokenCore: paused'
                    );
                });

            });

            context('when not paused', function() {

                it('pauses', async function() {
                    await this.contract['pause']({ from: pauser });
                    expect(await this.contract[`paused`]()).to.equal(true);
                });

                it('emits a Paused event', async function() {
                    const { logs } = await this.contract['pause']({ from: pauser });
                    expectEvent.inLogs(logs, 'Paused', { account: pauser });
                });

            });
            
        });
        
        context('from not pauser account', function() {

            it('reverts', async function() {
                await expectRevert(
                    this.contract['pause']({ from: other }),
                    'PauserRole: caller does not have the Pauser role'
                );
            });

        });
        
    });

    describe('seizing', function() {

        beforeEach(async function() {
            await this.contract['setGateway'](gateway, { from: owner });
            await this.contract['setInternalSupply'](42, { from: gateway });
            await this.contract['mint'](other, 42, { from: gateway });

            expect(await this.contract['totalSupply']()).to.be.bignumber.equal('42');
            expect(await this.contract['publicSupply']()).to.be.bignumber.equal('42');
        });
        
        context('from seizer account', function() {

            describe('when seizing enabled', function() {
                
                it('decreases public supply', async function() {
                    await this.contract['seizeFrom'](other, 21, "Because of a test", { from: seizer });
                    expect(await this.contract['publicSupply']()).to.be.bignumber.equal('21');
                });

                it('does not affect total supply', async function() {
                    await this.contract['seizeFrom'](other, 21, "Because of a test", { from: seizer });
                    expect(await this.contract['totalSupply']()).to.be.bignumber.equal('42');
                });
                
            });

            describe('when seizing disabled', function() {

                it('reverts', async function() {
                    await this.contract['disableSeizingPermamently']({ from: owner });
                    await expectRevert(
                        this.contract['seizeFrom'](other, 21, "Because of a test", { from: seizer }),
                        'MVNTokenCore: seizing is permamently disabled'
                    );
                });
                
            });
            
        });
        
        context('from other account', function() {

            it('reverts', async function() {
                await expectRevert(
                    this.contract['seizeFrom'](other, 42, "Because of a test", { from: other }),
                    'SeizerRole: caller does not have the Seizer role'
                );
            });

        });
        
    });

    describe('setting gateway', function() {

        context('from not gateway account', function() {

            it('reverts', async function() {
                await expectRevert(
                    this.contract['setGateway'](other, { from: other }),
                    'Ownable: caller is not the owner'
                );
            });

        });
        
    });

    describe('unpausing', function() {

        context('from pauser account', function() {

            context('when paused', function() {

                beforeEach(async function() {
                    await this.contract['pause']({ from: pauser });
                    expect(await this.contract['paused']()).to.equal(true);
                });
                
                it('unpauses', async function() {
                    await this.contract['unpause']({ from: pauser });
                    expect(await this.contract[`paused`]()).to.equal(false);
                });

                it('emits a Unpaused event', async function() {
                    const { logs } = await this.contract['unpause']({ from: pauser });
                    expectEvent.inLogs(logs, 'Unpaused', { account: pauser });
                });

            });

            context('when not paused', function() {

                beforeEach(async function() {
                    expect(await this.contract['paused']()).to.equal(false);
                });
                
                it('reverts', async function() {
                    await expectRevert(this.contract['unpause']({ from: pauser }),
                        'MVNTokenCore: not paused'
                    );
                });

            });
            
        });
        
        context('from not pauser account', function() {

            it('reverts', async function() {
                await expectRevert(
                    this.contract['unpause']({ from: other }),
                    'PauserRole: caller does not have the Pauser role'
                );
            });

        });
        
    });

    describe('approving', function() {

        const spender = otherAccounts[0];
        
        it('reverts when paused', async function() {
            await this.contract['pause']({ from: pauser });
            await expectRevert(
                this.contract['approve'](other, 42, { from: other }),
                'MVNTokenCore: paused'
            );
        });

        it('reverts when message sender is blacklisted', async function() {
            await this.contract['addBlacklisted'](other, { from: blacklistAdmin });
            await expectRevert(
                this.contract['approve'](spender, 42, { from: other }),
                'BlacklistedRole: account has the Blacklisted role'
            );
        });

        it('reverts when spender is blacklisted', async function() {
            await this.contract['addBlacklisted'](spender, { from: blacklistAdmin });
            await expectRevert(
                this.contract['approve'](spender, 42, { from: other }),
                'BlacklistedRole: account has the Blacklisted role'
            );
        });
        
    });

    describe('decreasing allowance', function() {

        const spender = otherAccounts[0];

        it ('works as expected', async function() {
            await this.contract['approve'](spender, 42, { from: other });
            await this.contract['decreaseAllowance'](spender, 7, { from: other });
            expect(await this.contract['allowance'](other, spender)).to.be.bignumber.equal('35');
        });
        
        it('reverts when paused', async function() {
            await this.contract['pause']({ from: pauser });
            await expectRevert(
                this.contract['decreaseAllowance'](other, 42, { from: spender }),
                'MVNTokenCore: paused'
            );
        });

        it('reverts when message sender is blacklisted', async function() {
            await this.contract['addBlacklisted'](other, { from: blacklistAdmin });
            await expectRevert(
                this.contract['decreaseAllowance'](spender, 42, { from: other }),
                'BlacklistedRole: account has the Blacklisted role'
            );
        });

        it('reverts when spender is blacklisted', async function() {
            await this.contract['addBlacklisted'](spender, { from: blacklistAdmin });
            await expectRevert(
                this.contract['decreaseAllowance'](spender, 42, { from: other }),
                'BlacklistedRole: account has the Blacklisted role'
            );
        });
        
    });

    describe('increasing allowance', function() {

        const spender = otherAccounts[0];

        it ('works as expected', async function() {
            await this.contract['approve'](spender, 42, { from: other });
            await this.contract['increaseAllowance'](spender, 7, { from: other });
            expect(await this.contract['allowance'](other, spender)).to.be.bignumber.equal('49');
        });
        
        it('reverts when paused', async function() {
            await this.contract['pause']({ from: pauser });
            await expectRevert(
                this.contract['increaseAllowance'](other, 42, { from: other }),
                'MVNTokenCore: paused'
            );
        });

        it('reverts when message sender is blacklisted', async function() {
            await this.contract['addBlacklisted'](other, { from: blacklistAdmin });
            await expectRevert(
                this.contract['increaseAllowance'](spender, 42, { from: other }),
                'BlacklistedRole: account has the Blacklisted role'
            );
        });

        it('reverts when spender is blacklisted', async function() {
            await this.contract['addBlacklisted'](spender, { from: blacklistAdmin });
            await expectRevert(
                this.contract['increaseAllowance'](spender, 42, { from: other }),
                'BlacklistedRole: account has the Blacklisted role'
            );
        });
        
    });

    describe('setting internal supply', function() {

        context('from gateway account', function() {

            beforeEach(async function() {
                await this.contract['setGateway'](gateway, { from: owner }); 
            });
            
            it('changes total supply', async function() {
                await this.contract['setInternalSupply'](42, { from: gateway });
                expect(await this.contract['totalSupply']()).to.be.bignumber.equal('42');
            });

            it('emits a InternalSupplyChanged event', async function() {
                const { logs } = await this.contract['setInternalSupply'](42, { from: gateway });
                expectEvent.inLogs(logs, 'InternalSupplyChanged', {
                    previousInternalSupply: '0', 
                    newInternalSupply: '42'
                });
            });
            
            it('reverts when public supply exceeds new internal supply', async function() {
                await this.contract['mint'](other, 42, { from: gateway });
                await expectRevert(
                    this.contract['setInternalSupply'](21, { from: gateway }),
                    'MVNToken: public supply exceeds new internal supply'
                );
            });

        });
        
        context('from other account', function() {

            it('reverts', async function() {
                await expectRevert(
                    this.contract['setInternalSupply'](42, { from: other }),
                    'MVNTokenCore: caller is not the Gateway'
                );
            });

        });
        
    });

    describe('transferring', function() {

        const sender = otherAccounts[0];
        const recipient = otherAccounts[0];
        
        context('from message sender account', function() {

            context('to transit account', function() {

                it('burns tokens on transit account', async function() {
                    await this.contract['setGateway'](gateway, { from: owner });
                    await this.contract['mint'](sender, 42, { from: gateway });
                    await this.contract['setGateway'](this.gateway.address, { from: owner });
                    await this.contract['transfer'](this.transitAccount.address, 42, { from: sender });
                    expect(await this.contract['balanceOf'](this.transitAccount.address)).to.be.bignumber.equal('0');
                });

            });

            context('to other account', function() {

                it('does not revert', async function() {
                    await this.contract['setGateway'](gateway, { from: owner });
                    await this.contract['mint'](sender, 42, { from: gateway });
                    await this.contract['transfer'](recipient, 42, { from: sender });
                });

            });
            
            it('reverts when paused', async function() {
                await this.contract['pause']({ from: pauser });
                await expectRevert(
                    this.contract['transfer'](recipient, 42, { from: other }),
                    'MVNTokenCore: paused'
                );
            });

            it('reverts when message sender is blacklisted', async function() {
                await this.contract['addBlacklisted'](other, { from: blacklistAdmin });
                await expectRevert(
                    this.contract['transfer'](recipient, 42, { from: other }),
                    'BlacklistedRole: account has the Blacklisted role'
                );
            });

            it('reverts when recipient is blacklisted', async function() {
                await this.contract['addBlacklisted'](recipient, { from: blacklistAdmin });
                await expectRevert(
                    this.contract['transfer'](recipient, 42, { from: other }),
                    'BlacklistedRole: account has the Blacklisted role'
                );
            });
            
        });

        context('from spender account', function() {

            const spender = otherAccounts[0];

            beforeEach(async function () {

                await this.contract['setGateway'](gateway, { from: owner });
                await this.contract['mint'](spender, 42, { from: gateway });
                await this.contract['setGateway'](this.gateway.address, { from: owner });
                await this.contract['approve'](sender, 42, { from: spender });

            });
            
            context('to transit account', function() {

                it('burns tokens on transit account', async function() {
                    await this.contract['transferFrom'](spender, this.transitAccount.address, 42, { from: sender });
                    expect(await this.contract['balanceOf'](this.transitAccount.address)).to.be.bignumber.equal('0');
                });

            });

            context('to other account', function() {

                it('transfers tokens', async function() {
                    await this.contract['transferFrom'](spender, other, 42, { from: sender });
                    expect(await this.contract['balanceOf'](other)).to.be.bignumber.equal('42');
                });

            });
            
            it('reverts when paused', async function() {
                await this.contract['pause']({ from: pauser });
                await expectRevert(
                    this.contract['transferFrom'](spender, recipient, 42, { from: sender }),
                    'MVNTokenCore: paused'
                );
            });

            it('reverts when message sender is blacklisted', async function() {
                await this.contract['addBlacklisted'](sender, { from: blacklistAdmin });
                await expectRevert(
                    this.contract['transferFrom'](spender, recipient, 42, { from: sender }),
                    'BlacklistedRole: account has the Blacklisted role'
                );
            });

            it('reverts when spender is blacklisted', async function() {
                await this.contract['addBlacklisted'](spender, { from: blacklistAdmin });
                await expectRevert(
                    this.contract['transferFrom'](spender, recipient, 42, { from: sender }),
                    'BlacklistedRole: account has the Blacklisted role'
                );
            });
            
            it('reverts when recipient is blacklisted', async function() {
                await this.contract['addBlacklisted'](recipient, { from: blacklistAdmin });
                await expectRevert(
                    this.contract['transferFrom'](spender, recipient, 42, { from: sender }),
                    'BlacklistedRole: account has the Blacklisted role'
                );
            });

        });
        
    });

    describe('permamently disabling seizing', function() {

        context('from owner account', function() {

            it('marks tokens as non-seizable', async function() {
                await this.contract['disableSeizingPermamently']({ from: owner });
                expect(await this.contract['seizingPermamentlyDisabled']()).to.equal(true);
            });

            it('emits SeizingPermamentlyDisabled event', async function() {
                const { logs } = await this.contract['disableSeizingPermamently']({ from: owner });
                expectEvent.inLogs(logs, 'SeizingPermamentlyDisabled', { account: owner });
            });
            
        });

        context('from other account', function() {
            
            it('reverts', async function() {
                await expectRevert(this.contract['disableSeizingPermamently']({ from: other }),
                    'Ownable: caller is not the owner'
                );
            });
            
        });
        
    });
});