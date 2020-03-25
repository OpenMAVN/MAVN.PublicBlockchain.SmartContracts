#Roles

| Role           | Can be transferred | Can be renounced | Intended to be used by MAVN officer | Intended to be used by automatic service |
|----------------|:------------------:|:----------------:|:------------------------------------:|:----------------------------------------:|
| Owner          | +                  | -                | +                                    | -                                        |
| Bridge         | -                  | +                | -                                    | +                                        |
| Linker         | -                  | +                | -                                    | +                                        |
| BlacklistAdmin | -                  | +                | +                                    | -                                        |
| Pauser         | -                  | +                | +                                    | -                                        |
| Seizer         | -                  | +                | +                                    | -                                        |

#Role Assignment

1. Add following variables to your environment variables or `.env` file:
    * For testnet deployment
        * `ROPSTEN_PRIVATE_KEY=0x...`
        * `ROPSTEN_NODE_URL=https://...`
    * For mainnet deployment
        * `MAINNET_PRIVATE_KEY=0x...`
        * `MAINNET_NODE_URL=https://...`
2. Execute `npm run add-role` with following parameters after additional `--` (ensure, that `build` directory is empty):
    * `--network=testnet` to deploy to the Ropsten network, or  `--network=mainnet` to deploy to the Ethereum mainnet
    * `--contract-type` - `MVNGateway` or `MVNToken`
    * `--contract-address` - address of a deployed contract instance
    * `--role` - name of the role
    * `--account` - address of an account, that will get the role
    