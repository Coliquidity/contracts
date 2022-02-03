import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { BigNumber, Signer } from 'ethers'
import { BalancesMap, parseBalancesCSV } from '../util/balance'
import fs from 'fs'
import { Logger } from '../util/log'
import { chunk } from '../test/support/all.helpers'
import { expect } from '../util/expect'
import { map } from 'lodash'
import { airdropRate, airdropStageShareDenominator, airdropStageShareNumerator } from '../test/support/BullToken.helpers'
import { network } from 'hardhat'
import { importExpectations } from '../util/expectation'
import { Address } from '../models/Address'
import { NetworkName, NetworkNameSchema } from '../models/NetworkName'
import { getOverrides } from '../util/network'
import { ContractName } from '../models/ContractName'
import { RunnableTaskArguments } from '../util/task'
import { Filename } from '../util/filesystem'

export async function transferManyTask(args: TransferManyTaskArguments, hre: HardhatRuntimeEnvironment): Promise<void> {
  const { contractName, contractAddress, balances: balancesPath, expectations: expectationsPath } = args
  const { network, ethers } = hre
  const [deployer] = await ethers.getSigners()
  const balancesCSV = fs.readFileSync(balancesPath)
  const expectations: TransferManyExpectationsMap = await importExpectations(expectationsPath)
  console.info('Parsing balances')
  const balances = await parseBalancesCSV(balancesCSV)
  console.info(`Attaching to ${contractName} contract at ${contractAddress}`)
  const ContractFactory = await hre.ethers.getContractFactory(contractName)
  const contract = await ContractFactory.attach(contractAddress)
  console.info('Calling transferMany')
  const networkName = NetworkNameSchema.parse(network.name)
  await transferMany(contract, balances, expectations, 400, networkName, deployer, console.info.bind(console))
}

export async function transferMany(contract: any, balances: BalancesMap, expectations: TransferManyExpectationsMap, chunkSize = 325, network: NetworkName, deployer: Signer, log?: Logger): Promise<void> {
  const balancesArr = Object.entries(balances)
  const balancesArrChunks = chunk(balancesArr, chunkSize)
  const totalAmount = balancesArr.reduce((acc, [address, amount]) => acc.add(amount), BigNumber.from(0))
  expect(totalAmount).to.be.equal(expectations.totalAmount)
  for (let i = 0; i < balancesArrChunks.length; i++) {
    const entries = balancesArrChunks[i]
    const entriesForDisplay = balancesArrChunks[i].map(([address, amount]) => [address, amount.toString()])
    log && log(`Chunk ${i + 1} / ${balancesArrChunks.length}:`)
    // log && log(fromPairs(entriesForDisplay))
    const addresses = map(entries, 0)
    const amounts = (map(entries, 1) as BigNumber[]).map((amount: BigNumber) => amount.mul(airdropStageShareNumerator).div(airdropStageShareDenominator).mul(airdropRate))
    // totalBULLAmount = amounts.reduce((acc, amount) => acc.add(amount), totalBULLAmount)
    const tx = await contract.transferMany(addresses, amounts, await getOverrides(deployer))
    log && log(`TX Hash: ${tx.hash}`)
  }

  // TODO: Ensure balances don't contain smart contract addresses
  // TODO: Ensure sum(balances) = totalAmount
  // TODO: Ensure specific balances amounts (smoke test)
}

interface TransferManyTaskArguments extends RunnableTaskArguments {
  contractName: ContractName
  contractAddress: Address
  balances: Filename
  expectations: Filename
}

export interface TransferManyExpectationsMap {
  balances: { [address: string]: BigNumber },
  totalAmount: BigNumber,
}
