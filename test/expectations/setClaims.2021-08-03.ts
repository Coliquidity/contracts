import { Decimal } from 'decimal.js'
import { toTokenAmount } from '../support/all.helpers'
import { maxSupplyTokenAmount } from '../support/ShieldToken.helpers'
import { airdropRate, airdropStageShareDenominator, airdropStageShareNumerator } from '../support/BullToken.helpers'
import { SetClaimsExpectationsMap } from '../../tasks/setClaimsBullTokenTask'

export const expectations: SetClaimsExpectationsMap = {
  balances: {
    '0xc77aab3c6d7dab46248f3cc3033c856171878bd5': toTokenAmount('0'), // locked liquidity
    '0x33a4288AB7043C274AACD2c9Eb8a931c30C0288a': toTokenAmount('0'), // NFTrade pool
    '0x7DCbeFB3b9A12b58af8759e0eB8Df05656dB911D': toTokenAmount( // Deployer
      new Decimal('0')
        .add(new Decimal('193117719.000000000000000000')) // prev balance
        .add(new Decimal('13685263.953164100000000000')) // prev liquidity pool
        // .add(new Decimal("5384238888.888888888888888888")) // 10% BULL
        .add(new Decimal('538423800.000000000000000000')) // 10% BULL
        .add(new Decimal('0')
          .add(new Decimal('191158366.000000000000000000')) // curr balance
          .add(new Decimal('20118008.646713800000000000')) // curr liquidity pool
          .mul(3),),
    ),
    '0x3aff228382d3D6a420f065DC87459557b4646ee1': toTokenAmount('0'), // BULL seller
    '0x0D2Be688Cb203Ee577B6bABbf84B933961497128': toTokenAmount('0'), // BULL seller
    '0x81DC6F15eE72F6E6d49CB6Ca44C0Bf8E63770027': toTokenAmount( // Stylo
      new Decimal('0')
        .add(new Decimal('1090600.19751302')) // prev balance
        .add(new Decimal('17790.000000000000000000')) // prev liquidity pool
        .add(new Decimal('0')
          .add(new Decimal('90600.1975130237')) // curr balance
          .add(new Decimal('17790.000000000000000000')) // curr liquidity pool
          .add(new Decimal('1000000')) // curr NFTrade
          .mul(3),),
    ),
    '0x86F7E1B163D8E7F85DEF9Ca6301Ce2B41f5c76ce': toTokenAmount( // winooze
      new Decimal('0')
        .add(new Decimal('19418.000000000000000000')) // prev balance
        .add(new Decimal('0')
          .add(new Decimal('86168.000000000000000000')) // curr balance
          .mul(3),),
    ),
  },
  totalSHLDAmount: {
    min: maxSupplyTokenAmount.mul(3),
    max: maxSupplyTokenAmount.mul(5),
  },
  totalBULLAmount: {
    min: maxSupplyTokenAmount.mul(airdropRate).mul(airdropStageShareNumerator).div(airdropStageShareDenominator),
    max: maxSupplyTokenAmount.mul(airdropRate),
  },
}