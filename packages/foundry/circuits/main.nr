use dep::std;

fn main(
    privateKey: Field,
    oldAmount: Field,
    witnesses: [Field; 32],
    leafIndex: Field,
    actionIndex: Field,
    token: pub Field,
    leaf: pub Field,
    merkleRoot: pub Field,
    nullifier: pub Field,
    nullifierIndex: pub Field,
    amount: pub Field,
    amountRelayer: pub Field,
    receiver: pub Field,
    relayer: pub Field,
    call: pub [Field; 32],
    isDeposit: pub Field
) {
    if isDeposit == 1 {
        deposit(
            privateKey,
            token,
            oldAmount,
            leaf,
            leafIndex,
            witnesses,
            merkleRoot,
            nullifier,
            amount,
            amountRelayer,
            receiver,
            relayer,
            call
        );
    } else {
        withdraw(
            privateKey,
            token,
            oldAmount,
            leaf,
            leafIndex,
            witnesses,
            merkleRoot,
            nullifier,
            amount,
            amountRelayer,
            receiver,
            relayer,
            call
        );
    }
}

fn deposit(
    privateKey: Field,
    token: Field,
    oldAmount: Field,
    leaf: Field,
    leafIndex: Field,
    witnesses: [Field; 32],
    merkleRoot: Field,
    nullifier: Field,
    amount: Field,
    amountRelayer: pub Field,
    receiver: pub Field,
    relayer: pub Field,
    call: pub [Field; 32]
) {}

fn withdraw(
    privateKey: Field,
    token: Field,
    oldAmount: Field,
    leaf: Field,
    leafIndex: Field,
    witnesses: [Field; 32],
    merkleRoot: Field,
    nullifier: Field,
    amount: Field,
    amountRelayer: pub Field,
    receiver: pub Field,
    relayer: pub Field,
    call: pub [Field; 32]
) {}

