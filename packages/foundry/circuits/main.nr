use dep::std;

fn main(
    // use signature to never reveal private key, usefull to use external service like sindri
    signature: [u8; 64],
    pub_key_x: Field,
    pub_key_y: Field,
    oldAmount: Field,
    witnesses: [Field; 32],
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
    // call 20 to fit 32 size
    call: pub [Field; 20],
    isDeposit: pub Field
) {
    // array of size 32 to easy merkle root it, explicit enumerate call field to win time of prove
    let arrayToHash: [Field;32] = [
        pub_key_x, pub_key_y, oldAmount, leafIndex, actionIndex, token, leaf, amount, amountRelayer, receiver, relayer, isDeposit, call[0], call[1], call[2], call[3], call[4], call[5], call[6], call[7], call[8], call[9],
        call[10], call[11], call[12], call[13], call[14], call[15], call[16], call[17], call[18], call[19]
    ];

    let hash:Field = compute_merkle_root(oldAmount, 0, arrayToHash);
    let hash_message:[u8;32]= field_to_bytes(hash);

    let key_x:[u8;32]= field_to_bytes(pub_key_x);
    let key_y:[u8;32]= field_to_bytes(pub_key_y);

    let valid_signature = std::ecdsa_secp256k1::verify_signature(key_x, key_y, signature, hash_message);
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

// update of noir implementation to use poseidon
fn compute_merkle_root<N>(leaf: Field, index: Field, hash_path: [Field; N]) -> Field {
    let n = hash_path.len();
    let index_bits = index.to_le_bits(n as u32);
    let mut current = leaf;
    for i in 0..n {
        let path_bit = index_bits[i] as bool;
        let (hash_left, hash_right) = if path_bit {
            (hash_path[i], current)
        } else {
            (current, hash_path[i])
        };
        current = std::hash::poseidon::bn254::hash_2([hash_left, hash_right]);
        //std::println("current");
        //std::println(current);
    }
    current
}

fn field_to_bytes(input: Field) -> [u8; 32] {
    let input_to_bytes:[u8] = input.to_le_bytes(32);
    let mut result :[u8;32] = [0; 32];
    for i in 0..32 {
        result[i] = input_to_bytes[i];
    }
    result
}
