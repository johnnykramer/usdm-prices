import { BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { Price } from '../generated/schema'
import { Exchange_underlyingCall } from '../generated/USDM3CRV/USDM3CRV'

export function handleExchangeUnderlying(call: Exchange_underlyingCall): void {
  let price = Price.load(call.transaction.hash.toHex())
  if (!price) {
    price = new Price(call.transaction.hash.toHex())
  }

  if (
    (call.inputs.j.isZero() && call.inputs.i.equals(BigInt.fromString('2'))) ||
    (call.inputs.i.isZero() && call.inputs.j.equals(BigInt.fromString('2')))
  ) {
    price.timestamp = call.block.timestamp

    const sixDecimals = BigInt.fromString('10')
      .pow(6)
      .toBigDecimal()
    const eighteenDecimals = BigInt.fromString('10')
      .pow(18)
      .toBigDecimal()

    if (call.inputs.i == BigInt.fromString('0')) {
      const leftPart = call.outputs.value0.toBigDecimal().div(sixDecimals)
      const rightPart = call.inputs._dx.toBigDecimal().div(eighteenDecimals)
      price.price = leftPart.div(rightPart)
    } else {
      const leftPart = call.inputs._dx.toBigDecimal().div(sixDecimals)
      const rightPart = call.outputs.value0.toBigDecimal().div(eighteenDecimals)
      price.price = leftPart.div(rightPart)
    }

    price.save()
  }
}
