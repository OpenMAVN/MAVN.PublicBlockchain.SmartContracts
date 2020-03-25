const { expect } = require('chai');

const MVNTransitAccount = artifacts.require('MVNTransitAccount');

contract('MVNToken', function ([_, owner]) {

    beforeEach(async function () {

        this.contract = await MVNTransitAccount.new({ from: owner });
        
    });
    
    it('returns correct name', async function() {
        expect(await this.contract['name']()).to.equal('Transit account for MAVN Utility Token');
    });
    
});