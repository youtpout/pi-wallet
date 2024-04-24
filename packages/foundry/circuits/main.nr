use dep::std;

fn main(
    privateKey: Field,
    token: Field,
    oldAmount: Field,
    witnesses: [Field; 32],
    leafIndex: Field,
    leaf: pub Field,
    merkleRoot: pub Field,
    nullifier: pub Field,
    amount: pub Field,
    receiver: pub Field,
    relayer: pub Field,
    isDeposit: pub Field
) {
    if isDeposit == 1 {
        deposit(privateKey, token, oldAmount, leaf, leafIndex, witnesses, merkleRoot, nullifier, amount);
    } else {
        withdraw(privateKey, token, oldAmount, leaf, leafIndex, witnesses, merkleRoot, nullifier, amount);
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
    amount: Field
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
    amount: Field
) {}

