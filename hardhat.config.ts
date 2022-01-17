import { task, types } from 'hardhat/config'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import '@typechain/hardhat'
import 'hardhat-watcher'
import 'solidity-coverage'
import '@openzeppelin/hardhat-upgrades'
import 'hardhat-dependency-compiler'
import { transferManyShieldTokenTask } from './tasks/transferManyShieldTokenTask'
import { addAllocationsShieldTokenTask } from './tasks/addAllocationsShieldTokenTask'
import { deployBullTokenTask } from './tasks/deployBullTokenTask'
import { claimBullTokenTask } from './tasks/claimBullTokenTask'
import { upgradeTokenTask } from './tasks/upgradeTokenTask'
import { rollbackBullTokenTask } from './tasks/rollbackBullTokenTask'
import { deployMCPTask } from './tasks/deployMCPTask'
import { deployContractTask } from './tasks/deployContractTask'
import { transferManyTask } from './tasks/transferManyTask'
import { HardhatUserConfig } from 'hardhat/types'
import { maxFeePerGas as gasPrice } from './util/gas'
import { mnemonic } from './util/config'
import { setClaimsTask } from './tasks/setClaimsTask'
import { writeClaimsTask } from './tasks/writeClaimsTask'
// import 'longjohn'
import { hours, minutes } from './util/time'
import { getJsonRpcUrl } from './util/ethereum'
import { deployColiTokenTask } from './tasks/deployColiTokenTask'
import { bscmainnet, bsctestnet, mainnet, ropsten } from './data/allNetworks'
import { Network } from './models/Network'
import { NetworkUserConfig } from 'hardhat/src/types/config'

// if (process.env.NODE_ENV !== 'production'){
//   require('longjohn');
// }

export const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  solidity: {
    compilers: [
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: '0.5.16',
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      initialDate: new Date(0).toISOString(),
      gasPrice,
      gasMultiplier: 1,
      // forking: {
      //   url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_MAINNET_API_KEY}`,
      //   blockNumber: 12779553,
      // },
      blockGasLimit: 8000000,
      accounts: {
        mnemonic: process.env.MNEMONIC || '',
      },
    },
    localhost: {
      //   accounts: {
      //     mnemonic: process.env.MNEMONIC || "",
      //   },
      gasPrice,
      gasMultiplier: 1.2,
      blockGasLimit: 8000000,
      timeout: 30 * minutes,
    },
    mainnet: fromNetwork(mainnet, {
      url: getJsonRpcUrl('mainnet'),
      gasPrice,
      gasMultiplier: 1.2,
      accounts: { mnemonic },
      timeout: 24 * hours,
    }),
    ropsten: fromNetwork(ropsten, {
      url: getJsonRpcUrl('ropsten'),
      gasPrice,
      gasMultiplier: 1.2,
      accounts: { mnemonic },
      timeout: 2 * minutes,
    }),
    bscmainnet: fromNetwork(bscmainnet, {
      url: 'https://bsc-dataseed.binance.org/',
      chainId: 56,
      gasPrice,
      gasMultiplier: 1.2,
      accounts: { mnemonic },
      timeout: 24 * hours,
    }),
    bsctestnet: fromNetwork(bsctestnet, {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      chainId: 97,
      gasPrice,
      gasMultiplier: 1.2,
      accounts: { mnemonic },
      timeout: 2 * minutes,
    }),
    avaxmainnet: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      chainId: 43114,
      gasPrice,
      gasMultiplier: 1.2,
      blockGasLimit: 8000000,
      accounts: { mnemonic },
      timeout: 24 * hours,
    },
    avaxtestnet: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      chainId: 43113,
      gasPrice,
      gasMultiplier: 1.2,
      blockGasLimit: 8000000,
      accounts: { mnemonic },
      timeout: 2 * minutes,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      ropsten: process.env.ETHERSCAN_API_KEY,

      bsc: process.env.BSCSCAN_API_KEY,
      bscTestnet: process.env.BSCSCAN_API_KEY,

      avalanche: process.env.SNOWTRACE_API_KEY,
      avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY,
    },
  },
  watcher: {
    run: {
      tasks: [
        'clean',
        { command: 'compile', params: { quiet: true } },
        { command: 'test', params: { noCompile: true, testFiles: ['testfile.ts'] } },
      ],
    },
  },
  typechain: {
    externalArtifacts: [
      'node_modules/@uniswap/v2-core/build/!(Combined-Json).json',
      'node_modules/@uniswap/v2-periphery/build/!(Combined-Json).json',
    ],
  },
  dependencyCompiler: {
    paths: [
      '@uniswap/v2-core/contracts/UniswapV2Pair.sol',
      '@uniswap/v2-core/contracts/UniswapV2Factory.sol',
      '@uniswap/v2-periphery/contracts/UniswapV2Router02.sol',
      '@uniswap/v2-periphery/contracts/test/WETH9.sol',
    ],
    // path: `${os.tmpdir()}/hardhat-dependency-compiler`,
  },
  // paths: {
  //   // sources: "?(.|./node_modules/@uniswap/v2-core|./node_modules/@uniswap/v2-periphery)/contracts",
  //   sources: "+(./contracts)",
  // },
}

function fromNetwork(network: Network, config: NetworkUserConfig): NetworkUserConfig {
  return {
    blockGasLimit: network.blockGasLimit,
    ...config,
  }
}

export default config

task('deployColiToken', 'Deploy ColiToken contract')
  .addParam('fromNetwork', '', undefined, types.string)
  .addParam('isPaused', '', false, types.boolean)
  .addParam('allocations', 'CSV file with allocations', undefined, types.string)
  .addParam('expectations', 'TypeScript file with test expectations', undefined, types.string)
  .addParam('cacheKey', 'Cache key (should be unique for each run group)', undefined, types.string)
  .setAction(deployColiTokenTask)

task('deployBullToken', 'Deploy BullToken contract')
  .setAction(deployBullTokenTask)

task('deployMCP', 'Deploy MCP contract')
  .addParam('feeDivisorMin', 'Minimal fee divisor', 100, types.int)
  .setAction(deployMCPTask)

task('deployContract', 'Deploy a contract')
  .addParam('contract', 'Contract name', undefined, types.string)
  .addOptionalParam('upgradeable', 'Deploy with upgradeable proxy', false, types.boolean)
  .addOptionalParam('constructorArgsModule', 'File path to a javascript module that exports the list of arguments.', undefined, types.inputFile)
  .addOptionalVariadicPositionalParam('constructorArgsParams', 'Contract constructor arguments. Ignored if the --constructorArgsModule option is used.', [])
  .setAction(deployContractTask)

task('transferManyShieldToken', 'Call transferManyShield for allocations without lockup period')
  .addParam('token', 'SHLD token contract address')
  .addParam('allocations', 'JSON with allocations')
  .addParam('chunk', 'Number of recipients in one chunk. Default value is 100.', 100, types.int)
  .setAction(transferManyShieldTokenTask)

task('addAllocations', 'Call addAllocations() for allocations with lockup period')
  .addParam('token', 'SHLD token contract address')
  .addParam('allocations', 'JSON with allocations')
  .setAction(addAllocationsShieldTokenTask)

task('writeClaims', 'Call setClaims() on BULL token contract')
  .addParam('dry', 'Dry-run: display planned actions but don\'t execute them', false, types.boolean, true)
  // .addParam('contractName', 'Contract name', '', types.string)
  // .addParam('contractAddress', 'Contract address', '', types.string)
  // .addParam('nextFolder', 'Folder with CSV files containing next SHLD balances (mult by 3)', '', types.string)
  // .addParam('prevFolder', 'Folder with CSV files containing prev SHLD balances (to set their claims to 0 if they don\'t hold SHLD anymore)', '', types.string)
  // .addParam('retroFolder', 'Folder with CSV files containing next SHLD balances (mult by 1)', '', types.string)
  // .addParam('blacklistFolder', 'Folder with CSV files containing blacklist SHLD balances (to set their claims to 0 always)', '', types.string)
  .addParam('out', 'Filename for writing the balances', undefined, types.string)
  .addParam('expectations', 'TypeScript file with test expectations')
  .addParam('cacheKey', 'Cache key (should be unique for each run group)', undefined, types.string)
  .setAction(writeClaimsTask)

task('setClaims', 'Call setClaims() on BULL token contract')
  .addParam('dry', 'Dry-run: display planned actions but don\'t execute them', false, types.boolean, true)
  .addParam('claims', 'JSON file with claim balances', '', types.string)
  // .addParam('expectations', 'TypeScript file with test expectations')
  .addParam('chunkSize', 'Number of addresses in a single transaction', 400, types.int)
  .addParam('cacheKey', 'Cache key (should be unique for each run group)', undefined, types.string)
  .setAction(setClaimsTask)

task('claim', 'Call claim() on BULL token contract')
  .addParam('token', 'BULL token contract address')
  .addParam('claimer', 'Claim transaction sender address')
  .addParam('claims', 'CSV file with addresses')
  .setAction(claimBullTokenTask)

task('rollback', 'Change the balances of BullToken back to certain date')
  .addParam('dry', 'Dry-run: display planned actions but don\'t execute them', false, types.boolean, true)
  .addParam('contractAddress', 'BULL token contract address')
  .addParam('from', 'From block number', undefined, types.int, false)
  .addParam('to', 'To block number', undefined, types.int, false)
  .addParam('pools', 'BULL token Uniswap pools addresses (comma-separated)')
  .addParam('holders', 'CSV file with token holder addresses')
  .addParam('expectations', 'TypeScript file with test expectations')
  .setAction(rollbackBullTokenTask)

task('upgradeToken', 'Upgrade a token contract')
  .addParam('name', 'Contract name')
  .addParam('address', 'Contract proxy address')
  .setAction(upgradeTokenTask)

task('transferMany', 'Upgrade a token contract')
  .addParam('dry', 'Dry-run: display planned actions but don\'t execute them', false, types.boolean, true)
  .addParam('contractName', 'Contract name')
  .addParam('contractAddress', 'Contract address')
  .addParam('balances', 'File with balances (download from blockchain explorer)')
  .addParam('expectations', 'TypeScript file with test expectations')
  .setAction(transferManyTask)
