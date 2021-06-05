import fs from "fs"
import { map, fromPairs, shuffle } from "lodash"
import type { ethers } from "ethers"
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"
import { BullToken } from "../typechain"
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types"

type Key = string;
type Ethers = typeof ethers & HardhatEthersHelpers;

export async function parseKeys(data: Buffer | string): Promise<Array<Key>> {
  return data.toString().split("\n")
}

export async function claimBullToken(token: BullToken, keys: Array<Key>, ethers: Ethers, log: ((msg: any) => void) | void): Promise<void> {
  for (const key of keys) {
    // const provider = new ethers.providers.JsonRpcProvider(`https://main-rpc.linkpool.io`)
    const wallet = new ethers.Wallet(Buffer.from(key, "hex"))
    const signer = wallet.connect(ethers.provider)
    const tokenWithSinger = token.connect(signer)
    const amountToClaim = await tokenWithSinger.claims(signer.address)
    const signerToString = `Address ${signer.address} (private key ${key.slice(0, 4)}...)`
    if (amountToClaim.isZero()) {
      log && log(`[WARN] ${signerToString} doesn't have any $BULL to claim - skipping`)
      continue
    }
    log && log(`[INFO] ${signerToString} has ${amountToClaim} $BULL to claim - sending TX`)
    const tx = await tokenWithSinger.claim()
    log && log(`[INFO] ${signerToString} confirmed TX: ${tx.hash}`)
  }
}

export async function claimBullTokenTask(args: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void> {
  const { token: tokenAddress, keys: keysPath } = args
  const { ethers } = hre
  console.log(`[INFO] Reading private keys from ${keysPath}`)
  const keys = await parseKeys(fs.readFileSync(keysPath))
  console.log(`[INFO] Attaching to contract ${tokenAddress}`)
  const Token = await ethers.getContractFactory("BullToken") as unknown as BullToken
  const token = await Token.attach(tokenAddress)
  console.log(`[INFO] Claiming $BULL`)
  await claimBullToken(token, keys, ethers)
}
