import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts"
import { AddAction } from "../generated/schema"
import { AddAction as AddActionEvent } from "../generated/WalletManager/WalletManager"
import { handleAddAction } from "../src/wallet-manager"
import { createAddActionEvent } from "./wallet-manager-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let nullifier = Bytes.fromI32(1234567890)
    let commitment = Bytes.fromI32(1234567890)
    let leafIndex = BigInt.fromI32(234)
    let proofData = "ethereum.Tuple Not implemented"
    let actionType = 123
    let newAddActionEvent = createAddActionEvent(
      nullifier,
      commitment,
      leafIndex,
      proofData,
      actionType
    )
    handleAddAction(newAddActionEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("AddAction created and stored", () => {
    assert.entityCount("AddAction", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "AddAction",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "nullifier",
      "1234567890"
    )
    assert.fieldEquals(
      "AddAction",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "commitment",
      "1234567890"
    )
    assert.fieldEquals(
      "AddAction",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "leafIndex",
      "234"
    )
    assert.fieldEquals(
      "AddAction",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "proofData",
      "ethereum.Tuple Not implemented"
    )
    assert.fieldEquals(
      "AddAction",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "actionType",
      "123"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
