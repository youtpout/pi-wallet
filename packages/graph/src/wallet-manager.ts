import { Address } from "@graphprotocol/graph-ts"
import {
  AddAction as AddActionEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../generated/WalletManager/WalletManager"
import { AddAction, TransferETH, TransferLink } from "../generated/schema"

export function handleAddAction(event: AddActionEvent): void {
  let entity = new AddAction(
    // nullifier is unique
    event.params.nullifier
  )
  entity.nullifier = event.params.nullifier
  entity.commitment = event.params.commitment
  entity.leafIndex = event.params.leafIndex
  entity.proofData_root = event.params.proofData.root
  entity.proofData_token = event.params.proofData.token
  entity.proofData_receiver = event.params.proofData.receiver
  entity.proofData_relayer = event.params.proofData.relayer
  entity.proofData_amount = event.params.proofData.amount
  entity.proofData_amountRelayer = event.params.proofData.amountRelayer
  entity.proofData_approve = event.params.proofData.approve
  entity.proofData_proof = event.params.proofData.proof
  entity.proofData_call = event.params.proofData.call
  entity.actionType = event.params.actionType

  if (event.params.proofData.token == Address.fromHexString("0x231d45b53C905c3d6201318156BDC725c9c3B9B1")) {
    // case transfer link
    createTransferLink(event)
  }

  if (event.params.proofData.token == Address.zero()) {
    // case transfer eth
    createTransferEth(event)
  }
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

function createTransferEth(event: AddActionEvent): void {
  let entity = new TransferETH(
    // nullifier is unique
    event.params.nullifier
  )
  entity.nullifier = event.params.nullifier
  entity.commitment = event.params.commitment
  entity.leafIndex = event.params.leafIndex
  entity.amount = event.params.proofData.amount
  entity.amountRelayer = event.params.proofData.amountRelayer
  entity.actionType = event.params.actionType

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

function createTransferLink(event: AddActionEvent): void {
  let entity = new TransferLink(
    // nullifier is unique
    event.params.nullifier
  )
  entity.nullifier = event.params.nullifier
  entity.commitment = event.params.commitment
  entity.leafIndex = event.params.leafIndex
  entity.amount = event.params.proofData.amount
  entity.amountRelayer = event.params.proofData.amountRelayer
  entity.actionType = event.params.actionType

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}


