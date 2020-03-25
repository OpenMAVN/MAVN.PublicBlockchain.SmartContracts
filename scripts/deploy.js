const argv = require('yargs').argv;
const axios = require('axios');
const delay = require('delay');
const fs = require('fs').promises;
const shell = require('shelljs');
const { API_URLS: etherscanApiUrls } = require('truffle-plugin-verify/constants');

const MVNGateway = artifacts.require("MVNGateway");
const MVNToken = artifacts.require("MVNToken");
const MVNTransitAccount = artifacts.require("MVNTransitAccount");
const networkId = artifacts.options.network_id;
const contractsBuildDirectory = artifacts.options.contracts_build_directory;
const etherscanApiUrl = etherscanApiUrls[networkId];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function updateArtifacts(contractName, contractAddress) {
    console.debug(`- Updating artifacts with deployment information`);
    const artifactPath = `${contractsBuildDirectory}/${contractName}.json`;
    const artifact = JSON.parse(JSON.stringify(require(artifactPath)));

    artifact.networks[networkId] = {
        "address": contractAddress
    };
    
    await fs.writeFile(artifactPath, JSON.stringify(artifact), 'utf8');
}

module.exports = async function(done) {

    // MVN Transit Account
    
    let mvnTransitAccount;

    try {
        console.info(`Creating MVN Transit Account on the ${argv.network} network.`);
        console.debug('- deploying MVNTransitAccount smart contract');
        mvnTransitAccount = await MVNTransitAccount['new']();
        console.debug(`- MVNTransitAccount smart contract deployed at ${mvnTransitAccount.address}`);
        await updateArtifacts('MVNTransitAccount', mvnTransitAccount.address);
        console.info(mvnTransitAccount.address);
        console.info(`MVN Transit Account on the ${argv.network} network has been created.`);
    } catch (error) {
        console.error(error);
        console.error(`Failed to create MVN Transit Account on the ${argv.network} network.`);
        
        done();
        return;
    }

    // MVN Token
    
    let mvnToken;

    try {
        console.info(`Creating MVN Token on the ${argv.network} network.`);
        console.debug('- deploying MVNToken smart contract with:');
        console.debug(`- transitAccount (address): ${mvnTransitAccount.address}`);
        mvnToken = await MVNToken['new'](mvnTransitAccount.address);
        console.debug(`- MVNToken smart contract deployed at ${mvnToken.address}`);
        await updateArtifacts('MVNToken', mvnToken.address);
        console.info(mvnToken.address);
        console.info(`MVN Token on the ${argv.network} newtwork has been created.`);
    } catch (error) {
        console.error(error);
        console.error(`Failed to create MVN Token on the ${argv.network} network.`);

        done();
        return;
    }

    // MVN Gateway

    let mvnGateway;

    try {
        console.info(`Creating MVN Gateway on the ${argv.network} network.`);
        console.debug('- deploying MVNGateway smart contract with:');
        console.debug(`- mvnToken (address): ${mvnToken.address}`);
        mvnGateway = await MVNGateway['new'](mvnToken.address);
        console.debug(`- MVNGateway smart contract deployed at ${mvnGateway.address}`);
        await updateArtifacts('MVNGateway', mvnGateway.address);
        console.debug(`- setting MVN Gateway address on MVN Token smart contract at ${mvnToken.address} with:`);
        console.debug(`- account (address): ${mvnGateway.address}`);
        await mvnToken['setGateway'](mvnGateway.address);
        console.debug(`- MVN Gateway address set to ${mvnGateway.address} on MVN Token at ${mvnToken.address}`);
        console.info(mvnGateway.address);
        console.info(`MVN Gateway on the ${argv.network} newtwork has been created.`);
    } catch (error) {
        console.error(error);
        console.error(`Failed to create MVN Gateway on the ${argv.network} network.`);

        done();
        return;
    }
    
    if (argv.verify) {
        try {
            console.info('Verifying contracts on etherscan.io');
            console.debug('- Waiting until etherscan detects deployment transactions...');

            let res;

            do {
                await delay(5000);

                res = await axios.get(`${etherscanApiUrl}?module=account&action=txlist&address=${mvnGateway.address}&page=1&sort=asc&offset=1`);

                if (res.data.status === '1') {
                    break;
                }

                console.debug('- Still waiting...')

            } while(true);
            
            const result = shell.exec(`npx truffle run verify MVNTransitAccount MVNToken MVNGateway --network ${argv.network}`).code;
            
            if (result !== 0) {
                throw `error code is ${result}`;
            }
            
            console.info('Contracts has been verified on etherscan.io.')
        } catch(error) {
            console.warn(error);
            console.warn('Verification on etherscan.io failed.')
        }
    }

    console.info();
    console.info('Deployment summary:');
    console.info('|-------------------|--------------------------------------------|');
    console.info(`| MVNTransitAccount | ${mvnTransitAccount.address              } |`);
    console.info(`| MVNToken          | ${mvnToken.address                       } |`);
    console.info(`| MVNGateway        | ${mvnGateway.address                     } |`);
    console.info('|-------------------|--------------------------------------------|');
    
    done();  
};