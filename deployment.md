#Deployment

1. Add following variables to your environment variables or `.env` file:
    * For testnet deployment
        * `ROPSTEN_PRIVATE_KEY=0x...`
        * `ROPSTEN_NODE_URL=https://...`
    * For mainnet deployment
        * `MAINNET_PRIVATE_KEY=0x...`
        * `MAINNET_NODE_URL=https://...`
2. Execute `npm run deploy` with following parameters after additional `--` (ensure, that `build` directory is empty):
    * `--network testnet` to deploy to the Ropsten network, or  `--network mainnet` to deploy to the Ethereum mainnet
    * `--verify true` if it is necessary to verify contracts on etherscan.io