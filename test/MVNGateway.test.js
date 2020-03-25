const { expectRevert, constants, expectEvent } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;
const { expect } = require('chai');

const MVNTokenMock = artifacts.require('MVNTokenMock');
const MVNTransitAccount = artifacts.require('MVNTransitAccount');
const MVNGateway = artifacts.require('MVNGateway');

contract('MVNGateway', function ([_, owner, bridge, linker, other, ...otherAccounts]) {

    beforeEach(async function () {

        this.transitAccount = await MVNTransitAccount.new({ from: owner });
        this.mvnToken = await MVNTokenMock.new(this.transitAccount.address, { from: owner });
        this.contract = await MVNGateway.new(this.mvnToken.address, { from: owner });

        await this.contract.addBridge(bridge, { from: owner });
        await this.contract.addLinker(linker, { from: owner });
        
        expect(await this.contract['isBridge'](bridge, { from: owner })).to.equal(true);
        expect(await this.contract['isLinker'](linker, { from: owner })).to.equal(true);
        
    });

    it('has correct name', async function() {
        expect(await this.contract['name']()).to.equal('Gateway for MAVN Utility Token');
    });
    
    describe('linking public account', function() {
        
        const internalAccount = otherAccounts[0];
        const publicAccount = otherAccounts[1];
        
        context('from linker account', function() {

            it('links public account to an internal account', async function() {
                await this.contract['linkPublicAccount'](internalAccount, publicAccount, { from: linker });
                expect(await this.contract['getPublicAccount'](internalAccount)).to.equal(publicAccount);
            });

            it('links internal account to a public account', async function() {
                await this.contract['linkPublicAccount'](internalAccount, publicAccount, { from: linker });
                expect(await this.contract['getInternalAccount'](publicAccount)).to.equal(internalAccount);
            });

            it('emits a PublicAccountLinked event', async function() {
                const { logs } = await this.contract['linkPublicAccount'](internalAccount, publicAccount, { from: linker });
                expectEvent.inLogs(logs, 'PublicAccountLinked', { 
                    internalAccount: internalAccount,
                    publicAccount: publicAccount 
                });
            });

            describe('when internal account is null', function() {

                it('reverts', async function() {
                    await expectRevert(this.contract['linkPublicAccount'](ZERO_ADDRESS, publicAccount, { from: linker }),
                        'MVNGatewayCore: internal account is the zero address'
                    );
                });
                
            });

            describe('when public account is null', function() {

                it('reverts', async function() {
                    await expectRevert(this.contract['linkPublicAccount'](internalAccount, ZERO_ADDRESS, { from: linker }),
                        'MVNGatewayCore: public account is the zero address'
                    );
                });
                
            });
        });
        
        context('from other account', function() {

            it ('reverts', async function() {
                await expectRevert(this.contract['linkPublicAccount'](internalAccount, publicAccount, { from: other }),
                    'LinkerRole: caller does not have the Linker role'
                );
            });
            
        })
        
    });

    context('re-linking public account', function() {

        const internalAccount = otherAccounts[0];
        const oldPublicAccount = otherAccounts[1];
        const newPublicAccount = otherAccounts[2];

        it('links new public account to an internal account', async function() {
            await this.contract['linkPublicAccount'](internalAccount, oldPublicAccount, { from: linker });
            
            await this.contract['linkPublicAccount'](internalAccount, newPublicAccount, { from: linker });
            expect(await this.contract['getPublicAccount'](internalAccount)).to.equal(newPublicAccount);
        });

        it('links internal account to the new public account', async function() {
            await this.contract['linkPublicAccount'](internalAccount, oldPublicAccount, { from: linker });
            
            await this.contract['linkPublicAccount'](internalAccount, newPublicAccount, { from: linker });
            expect(await this.contract['getInternalAccount'](newPublicAccount)).to.equal(internalAccount);
        });

        it('unlinks previous public account from an internal account', async function() {
            await this.contract['linkPublicAccount'](internalAccount, oldPublicAccount, { from: linker });
            
            await this.contract['linkPublicAccount'](internalAccount, newPublicAccount, { from: linker });
            expect(await this.contract['getInternalAccount'](oldPublicAccount)).to.equal(ZERO_ADDRESS);
        });

        it('emits a PublicAccountUnlinked event', async function() {
            await this.contract['linkPublicAccount'](internalAccount, oldPublicAccount, { from: linker });
            
            const { logs } = await this.contract['linkPublicAccount'](internalAccount, newPublicAccount, { from: linker });
            expectEvent.inLogs(logs, 'PublicAccountUnlinked', {
                internalAccount: internalAccount,
                publicAccount: oldPublicAccount 
            });
        });

        it('emits a PublicAccountLinked event', async function() {
            await this.contract['linkPublicAccount'](internalAccount, oldPublicAccount, { from: linker });
            
            const { logs } = await this.contract['linkPublicAccount'](internalAccount, newPublicAccount, { from: linker });
            expectEvent.inLogs(logs, 'PublicAccountLinked', { 
                internalAccount: internalAccount, 
                publicAccount: newPublicAccount 
            });
        });

    });

    describe('unlinking public account', function() {

        const internalAccount = otherAccounts[0];
        const publicAccount = otherAccounts[1];

        context('from linker account account', function() {

            it('unlinks public account from an internal account', async function() {
                await this.contract['linkPublicAccount'](internalAccount, publicAccount, { from: linker });
                
                await this.contract['unlinkPublicAccount'](internalAccount, { from: linker });
                expect(await this.contract['getPublicAccount'](internalAccount)).to.equal(ZERO_ADDRESS);
            });

            it('unlinks internal account from a public account', async function() {
                await this.contract['linkPublicAccount'](internalAccount, publicAccount, { from: linker });
                
                await this.contract['unlinkPublicAccount'](internalAccount, { from: linker });
                expect(await this.contract['getInternalAccount'](publicAccount)).to.equal(ZERO_ADDRESS);
            });

            it('emits a PublicAccountUnlinked event', async function() {
                await this.contract['linkPublicAccount'](internalAccount, publicAccount, { from: linker });
                
                const { logs } = await this.contract['unlinkPublicAccount'](internalAccount, { from: linker });
                expectEvent.inLogs(logs, 'PublicAccountUnlinked', {
                    internalAccount: internalAccount,
                    publicAccount: publicAccount
                });
            });

            describe('when public account is not linked', function() {

                it('reverts', async function() {
                    await expectRevert(this.contract['unlinkPublicAccount'](other, { from: linker }),
                        'MVNGatewayCore: public account is not linked'
                    );
                });

            });
            
            describe('when internal account is null', function() {

                it('reverts', async function() {
                    await expectRevert(this.contract['unlinkPublicAccount'](ZERO_ADDRESS, { from: linker }),
                        'MVNGatewayCore: internal account is the zero address'
                    );
                });
                
            });
            
        });
        
        context('from other account', function() {

            it ('reverts', async function() {
                await expectRevert(this.contract['unlinkPublicAccount'](internalAccount, { from: other }),
                    'LinkerRole: caller does not have the Linker role'
                );
            });

        });

    });

    describe('setting internal supply', function() {

        context('from bridge account', function() {

            it('changes total supply of MVN tokens', async function() {
                const { tx } = await this.contract['setInternalSupply'](42, { from: bridge });

                await expectEvent.inTransaction(tx, MVNTokenMock, 'SetInternalSupply', {
                    internalSupply: '42'
                });
            });
            
        });
        
        context('from other account', function() {

            it ('reverts', async function() {
                await expectRevert(this.contract['setInternalSupply'](42, { from: other }),
                    'BridgeRole: caller does not have the Bridge role'
                );
            });

        })

    });

    describe('transferring to internal network', function() {

        const internalAccount = otherAccounts[0];
        const publicAccount = otherAccounts[1];
        
        context('from MVN token', function() {

            it('emits a TransferredToInternalNetwork event', async function() {
                await this.contract['linkPublicAccount'](internalAccount, publicAccount, { from: linker });
                
                const { tx } = await this.mvnToken['triggerTransferToInternalNetwork'](this.contract.address, publicAccount, 42);

                await expectEvent.inTransaction(tx, MVNGateway, 'TransferredToInternalNetwork', { 
                    publicAccount: publicAccount,
                    internalAccount: internalAccount,
                    publicTransferId: '0',
                    amount: '42'
                });
            });

            it('reverts when public account is the null account', async function () {
                await expectRevert(
                    this.contract['transferToInternalNetwork'](ZERO_ADDRESS, 42, { from: this.mvnToken.address }),
                    'MVNGatewayCore: public account is the zero address'
                );
            });

            it('reverts when public account is not linked with an internal account', async function () {
                await expectRevert(
                    this.contract['transferToInternalNetwork'](publicAccount, 42, { from: this.mvnToken.address }),
                    'MVNGatewayCore: internal account is not linked'
                );
            });
            
        });
        
        context('from other account', function() {

            it ('reverts', async function() {
                await expectRevert(this.contract['transferToInternalNetwork'](publicAccount, 42, { from: other }),
                    'MVNGatewayCore: caller is not the MVNToken'
                );
            });

        });

    });

    describe('transferring from internal network', function() {

        const internalAccount = otherAccounts[0];
        const publicAccount = otherAccounts[1];
        
        context('from bridge account', function() {

            it ('triggers tokens mint', async function() {
                await this.contract['linkPublicAccount'](internalAccount, publicAccount, { from: linker });
                
                const { tx } = await this.contract['transferFromInternalNetwork'](internalAccount, publicAccount, 1, 42, { from: bridge });
                await expectEvent.inTransaction(tx, MVNTokenMock, 'Mint', {
                    account: publicAccount,
                    amount: '42'
                });
            });

            it('emits a TransferredFromInternalNetwork event', async function() {
                await this.contract['linkPublicAccount'](internalAccount, publicAccount, { from: linker });
                
                const { logs } = await this.contract['transferFromInternalNetwork'](internalAccount, publicAccount, 1, 42, { from: bridge });
                expectEvent.inLogs(logs, 'TransferredFromInternalNetwork', {
                    internalAccount: internalAccount,
                    publicAccount: publicAccount,
                    internalTransferId: '1', 
                    amount: '42' 
                });
            });

            it('reverts when transfer has already been processed', async function() {
                await this.contract['linkPublicAccount'](internalAccount, publicAccount, { from: linker });
                await this.contract['transferFromInternalNetwork'](internalAccount, publicAccount, 1, 42, { from: bridge });

                await expectRevert(
                    this.contract['transferFromInternalNetwork'](internalAccount, publicAccount, 1, 42, { from: bridge }),
                    'MVNGatewayCore: incoming transfer has already been processed'
                );
            });
            
            it('reverts when internal account is the null account', async function () {
                await expectRevert(
                    this.contract['transferFromInternalNetwork'](ZERO_ADDRESS, publicAccount, 1, 42, { from: bridge }),
                    'MVNGatewayCore: internal account is the zero address'
                );
            });

            it('reverts when public account is the null account', async function () {
                await expectRevert(
                    this.contract['transferFromInternalNetwork'](internalAccount, ZERO_ADDRESS, 1, 42, { from: bridge }),
                    'MVNGatewayCore: public account is the zero address'
                );
            });
            
        });
        
        context('from other account', function() {

            it ('reverts', async function() {
                await expectRevert(this.contract['transferFromInternalNetwork'](internalAccount, publicAccount, 14, 42, { from: other }),
                    'BridgeRole: caller does not have the Bridge role'
                );
            });

        });

    });
    
});