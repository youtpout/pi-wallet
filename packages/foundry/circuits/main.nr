use dep::std;
use dep::std::slice;

fn main(
    // use signature to never reveal private key, usefull to use external service like sindri
    signature: [u8; 64],
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
    oldAmount: Field,
    witnesses: [[u8; 32]; 32],
    leafIndex: Field,
    actionIndex: Field,
    unique: pub [u8; 32],
    token: pub [u8; 20],
    leaf: pub [u8; 32],
    merkleRoot: pub [u8; 32],
    // nullifier hash publicKey Index ?
    nullifier: pub [u8; 32],
    amount: pub Field,
    amountRelayer: pub [u8; 32],
    receiver: pub [u8; 20],
    relayer: pub [u8; 20],
    isDeposit: pub [u8; 1],
    call: pub [u8; 256]
) {
    // must be an action index > 0
    assert(actionIndex != 0);
    assert(amount != 0);

    let mut newAmount= 0;
    if isDeposit == [1] {
        newAmount = oldAmount + amount;
    } else {
        let amountOut = U128::from_integer(amount);
        let amountOld = U128::from_integer(oldAmount);
        // can't withdraw more than balance
        assert(amountOld >= amountOut);
        newAmount = oldAmount - amount;
    }

    let mut array_concat:([u8;512],[u8;96]) = concat_data(
        pub_key_x,
        pub_key_y,
        field_to_bytes(actionIndex),
        token,
        field_to_bytes(newAmount),
        amountRelayer,
        receiver,
        relayer,
        isDeposit,
        call
    );

    // use blake 3 to hash
    let hash_message:[u8;32] = std::hash::blake3(array_concat.0);

    let hash_unique:[u8;32] = std::hash::blake3(array_concat.1);

    // check data match hash generated
    assert(leaf == hash_message);
    assert(unique == hash_unique);

    // the user only need to sign with is private key to generate merkle leaf
    let valid_signature = std::ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, signature, hash_message);
    assert(valid_signature);

    if (actionIndex == 1) {
        assert(oldAmount == 0);
    } else {
        // the first deposit don't need to prove old actions
        let computed_root = compute_merkle_root(leaf, leafIndex, witnesses);
        assert(computed_root == merkleRoot);
    }
}

fn deposit(
    oldAmount: [u8; 32],
    witnesses: [[u8; 32]; 32],
    leafIndex: [u8; 32],
    actionIndex: [u8; 32],
    unique: pub [u8; 32],
    token: pub [u8; 20],
    leaf: pub [u8; 32],
    merkleRoot: pub [u8; 32],
    // nullifier hash publicKey Index ?
    nullifier: pub [u8; 32],
    amount: pub [u8; 32],
    amountRelayer: pub [u8; 32],
    receiver: pub [u8; 20],
    relayer: pub [u8; 20],
    isDeposit: pub [u8; 1],
    call: pub [u8; 256]
) {}

fn withdraw(
    oldAmount: [u8; 32],
    witnesses: [[u8; 32]; 32],
    leafIndex: [u8; 32],
    actionIndex: [u8; 32],
    unique: pub [u8; 32],
    token: pub [u8; 20],
    leaf: pub [u8; 32],
    merkleRoot: pub [u8; 32],
    // nullifier hash publicKey Index ?
    nullifier: pub [u8; 32],
    amount: pub [u8; 32],
    amountRelayer: pub [u8; 32],
    receiver: pub [u8; 20],
    relayer: pub [u8; 20],
    isDeposit: pub [u8; 1],
    call: pub [u8; 256]
) {}

// update of noir implementation to use sha (best ratio perf/gas for solidity)
fn compute_merkle_root<N>(leaf: [u8; 32], index: Field, hash_path: [[u8; 32]; N]) -> [u8; 32] {
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
        let mut arr:[u8;64]= [0; 64];
        for i in 0..32 {
            arr[i] = hash_left[i];
            arr[i+32]=hash_right[i];
        }
        current = std::hash::sha256(arr);
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

fn concat_data(
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
    actionIndex: [u8; 32],
    token: [u8; 20],
    amount: [u8; 32],
    amountRelayer: [u8; 32],
    receiver: [u8; 20],
    relayer: [u8; 20],
    isDeposit: [u8; 1],
    call: [u8; 256]
) -> ([u8; 512], [u8; 96]) {
    let mut array_concat:[u8;512] = [0; 512];
    let mut array_unique:[u8;96]= [0; 96];

    for i in 0..512 {
        if i < 32 {
            array_concat[i] = pub_key_x[i];
            array_unique[i] = pub_key_x[i];
        } else if i < 64 {
            let index = i - 32;
            array_concat[i] = pub_key_y[index];
            array_unique[i] = pub_key_y[index];
        } else if i < 96 {
            let index = i - 96;
            array_concat[i] = actionIndex[index];
            array_unique[i] = actionIndex[index];
        } else if i < 116 {
            let index = i - 116;
            array_concat[i] = token[index];
        } else if i < 148 {
            let index = i - 148;
            array_concat[i] = amount[index];
        } else if i < 180 {
            let index = i - 180;
            array_concat[i] = amountRelayer[index];
        } else if i < 212 {
            let index = i - 212;
            array_concat[i] = receiver[index];
        } else if i < 232 {
            let index = i - 232;
            array_concat[i] = relayer[index];
        } else if i < 252 {
            let index = i - 252;
            array_concat[i] = isDeposit[index];
        } else if i < 477 {
            let index = i - 477;
            array_concat[i] = call[index];
        }
    }
    (array_concat, array_unique)
}

