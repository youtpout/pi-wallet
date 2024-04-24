use dep::std;

fn main(
    // use signature to never reveal private key, usefull to use external service like sindri
    signature: [u8; 64],
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
    oldAmount: Field,
    witnesses: [[u8; 32]; 32],
    leafIndex: Field,
    actionIndex: Field,
    token: pub Field,
    leaf: pub Field,
    merkleRoot: pub Field,
    // nullifier hash publicKey Index ?
    nullifier: pub Field,
    amount: pub Field,
    amountRelayer: pub Field,
    receiver: pub Field,
    relayer: pub Field,
    call: pub [Field; 10],
    isDeposit: pub Field
) {
    // hash call before integrate
    let hashCall = std::hash::poseidon::bn254::hash_10(call);
    let hashSignature = std::hash::poseidon::bn254::hash_1(pub_key_x);
    let hash = std::hash::poseidon::bn254::hash_10(
        [
        publicKey, oldAmount, leafIndex, actionIndex, token, amount, amountRelayer, receiver, relayer, hashCall
    ]
    );

    let valid_signature = std::ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, signature, hash);
    assert(valid_signature);

    if isDeposit == 1 {} else {}
}

fn deposit(
    publicKey: Field,
    token: Field,
    oldAmount: Field,
    leaf: Field,
    leafIndex: Field,
    actionIndex: Field,
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
    publicKey: Field,
    token: Field,
    oldAmount: Field,
    leaf: Field,
    leafIndex: Field,
    actionIndex: Field,
    witnesses: [Field; 32],
    merkleRoot: Field,
    nullifier: Field,
    amount: Field,
    amountRelayer: pub Field,
    receiver: pub Field,
    relayer: pub Field,
    call: pub [Field; 32]
) {}

