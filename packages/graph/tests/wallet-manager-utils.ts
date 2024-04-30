import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  AddAction,
  OwnershipTransferred
} from "../generated/WalletManager/WalletManager"

export function createAddActionEvent(
  nullifier: Bytes,
  commitment: Bytes,
  leafIndex: BigInt,
  proofData: ethereum.Tuple,
  actionType: i32
): AddAction {
  let addActionEvent = changetype<AddAction>(newMockEvent())

  addActionEvent.parameters = new Array()

  addActionEvent.parameters.push(
    new ethereum.EventParam(
      "nullifier",
      ethereum.Value.fromFixedBytes(nullifier)
    )
  )
  addActionEvent.parameters.push(
    new ethereum.EventParam(
      "commitment",
      ethereum.Value.fromFixedBytes(commitment)
    )
  )
  addActionEvent.parameters.push(
    new ethereum.EventParam(
      "leafIndex",
      ethereum.Value.fromUnsignedBigInt(leafIndex)
    )
  )
  addActionEvent.parameters.push(
    new ethereum.EventParam("proofData", ethereum.Value.fromTuple(proofData))
  )
  addActionEvent.parameters.push(
    new ethereum.EventParam(
      "actionType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(actionType))
    )
  )

  return addActionEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}
