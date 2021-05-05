# How to Deploy:

## 0. Pre-Requirements:

- Setup `INFURA_API_KEY`, `ETHERSCAN_API_KEY`, and `MNEMONIC` in `.env` file. (see `.env.example` for details).
- In`parameters.ts` set `ALLOCATIONS` and `RELEASE_TIME`
  
## 1. Deploy

### Localhost:
`npm run deploy`

### Mainnet/ropsten:
`npm run deploy -- --network {mainnet|ropsten}`

Example output:
```
Compiling 1 file with 0.8.4
Compilation finished successfully
Creating Typechain artifacts in directory typechain for target ethers-v5
Successfully generated Typechain artifacts!
Deploying with the account: 0x28A987cA00b4984ecC7d2f3f35E10451A0D8e5Ff
Proxy address: 0xA1E58E80661939Aa028856119911061465a3ce5F
Implementation address: 0x986F538Cd6AC1C25C13c4e8D5A24FfB29eded4E2
Vesting "0": added for 3 addresses
Vesting "1": added for 2 addresses
Vesting "2": added for 2 addresses
```

## 2. Etherscan verification

`npx hardhat verify --network ropsten <implementation-address>`

## 3. Attach to token in the console:

```
// Start console
npx hardhat console --network ropsten

const Token = await ethers.getContractFactory("ShieldToken")
const token = await Token.attach('<Proxy address>')
```

### Enable defense

```
// disable transers for 100 blocks from now
await token.disableTransfers(100)
```

### Disable defense forever
```
await token.disableBurnBeforeBlockNumber()
```