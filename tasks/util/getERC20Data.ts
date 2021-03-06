import { Address } from '../../models/Address'
import { BlockTag } from '@ethersproject/abstract-provider/src.ts/index'
import { Ethers } from '../../util-local/types'
import { BalanceBN, validateBalanceBN } from '../../models/BalanceBN'
import { getGenericToken } from './getToken'
import { getTransfersPaginatedCached } from './getTransfers'
import { unwrapSmartContractBalancesAtBlockTag } from './unwrapSmartContractBalancesAtBlockTag'
import { debug } from '../../util/debug'
import { deployedAt } from '../../test/support/ColiToken.helpers'
import { chunk, flatten, uniq } from 'lodash'
import { maxRequestsPerSecond } from '../../util-local/getblock'
import { seqMap } from '../../util/promise'
import { getCacheKey } from '../../util/cache'
import { isZeroBalance } from '../../util-local/balance'
import { Cache } from 'cache-manager'
import { CachedRunnableContext } from '../../util-local/context/getCachedContext'

export async function getERC20HolderAddressesAtBlockTag(blockTag: BlockTag, contractAddress: Address, ethers: Ethers, cache: Cache): Promise<Address[]> {
  debug(__filename, getERC20HolderAddressesAtBlockTag, blockTag, contractAddress)
  const token = await getGenericToken(contractAddress, ethers)
  const transfers = await getTransfersPaginatedCached(token, deployedAt, blockTag, cache)
  return uniq(transfers.map(t => t.to))
}

export async function getERC20BalancesAtBlockTagPaginated(blockTag: BlockTag, contractAddress: Address, context: CachedRunnableContext): Promise<BalanceBN[]> {
  const { cache, ethers } = context
  const addresses = await getERC20HolderAddressesAtBlockTag(blockTag, contractAddress, ethers, cache)
  const addressesPaginated = chunk(addresses, maxRequestsPerSecond / 2)
  const balances = flatten(await seqMap(addressesPaginated, addressPage => getERC20BalancesForAddressesAtBlockTagCached(addressPage, blockTag, contractAddress, ethers, cache)))
  const balancesWithoutZeros = balances.filter(b => !isZeroBalance(b))
  return unwrapSmartContractBalancesAtBlockTag(balancesWithoutZeros, blockTag, contractAddress, context)
}

// export async function getERC20BalancesAtBlockTag(blockTag: BlockTag, contractAddress: Address, context: RunnableContext): Promise<BalanceBN[]> {
//   const { ethers } = context
//   const addresses = await getERC20HolderAddressesAtBlockTag(blockTag, contractAddress, ethers)
//   const balances = await getERC20BalancesForAddressesAtBlockTagCached(addresses, blockTag, contractAddress, ethers, cache)
//   const balancesWithoutZeros = balances.filter(b => !isZeroBalance(b))
//   return unwrapSmartContractBalances(balancesWithoutZeros, context)
// }

export async function getERC20BalanceForAddressAtBlockTag(address: Address, blockTag: BlockTag, contractAddress: Address, ethers: Ethers): Promise<BalanceBN> {
  debug(__filename, getERC20BalanceForAddressAtBlockTag, address, blockTag, contractAddress)
  const token = await getGenericToken(contractAddress, ethers)
  const amount = await token.balanceOf(address, { blockTag })
  return validateBalanceBN({ address, amount })
}

export async function getERC20BalanceForAddressAtBlockTagCached(address: Address, blockTag: BlockTag, contractAddress: Address, ethers: Ethers, cache: Cache): Promise<BalanceBN> {
  const cacheKey = getCacheKey(getERC20BalanceForAddressAtBlockTagCached, address, blockTag, contractAddress)
  const balanceCached = await cache.wrap<BalanceBN>(cacheKey, () => getERC20BalanceForAddressAtBlockTag(address, blockTag, contractAddress, ethers))
  return validateBalanceBN(balanceCached)
}

async function getERC20BalancesForAddressesAtBlockTagCached(addresses: Address[], blockTag: BlockTag, contractAddress: Address, ethers: Ethers, cache: Cache) {
  return Promise.all(addresses.map(address => getERC20BalanceForAddressAtBlockTagCached(address, blockTag, contractAddress, ethers, cache)))
}
