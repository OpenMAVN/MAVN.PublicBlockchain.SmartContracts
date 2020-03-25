require('dotenv').config();

const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  networks: {
    testnet: {
      provider: function() {
        return new HDWalletProvider(process.env.ROPSTEN_PRIVATE_KEY, process.env.ROPSTEN_NODE_URL);
      },
      network_id: '3'
    },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(process.env.MAINNET_PRIVATE_KEY, process.env.MAINNET_NODE_URL);
      },
      network_id: '1'
    }
  },
  compilers: {
    solc: {
      version: "0.5.12"
    }
  },
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  },
  plugins: [
    'truffle-plugin-verify'
  ]
};
