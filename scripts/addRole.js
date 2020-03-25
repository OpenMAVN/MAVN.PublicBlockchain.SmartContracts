const yargs = require('yargs');

const MVNGateway = artifacts.require("MVNGateway");
const MVNToken = artifacts.require("MVNToken");

module.exports = async function(callback) {

    try {

        const requiredOptions = ['contract-type','contract-address','role','account'];
        const argv = yargs.demandOption(requiredOptions).argv;
        
        const role = argv['role'];
        const contractType = argv['contract-type'];
        const contractAddress = argv['contract-address'];
        const account = argv['account'];

        let contract;
        
        switch (contractType) {
            case 'MVNGateway':
                contract = MVNGateway;
                break;
            case 'MVNToken':
                contract = MVNToken;
                break;
            default:
                throw `${contractType} contract type is not supported.`;
        }
        
        const contractInstance = await contract.at(contractAddress);
        
        if (!contractInstance[`add${role}`]) {
            throw `${role} is not supported`;
        }

        console.info(`Adding ${role} for ${account} to the ${contractType} at ${contractAddress} on the ${argv.network} network.`);
        
        await contractInstance[`add${role}`](account);

        console.log('Role has been added');
        
    } catch(error) {
        console.error(error);
        console.error('Failed to add role.')
    }

    callback();
};