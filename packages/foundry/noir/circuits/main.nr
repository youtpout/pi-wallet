use dep::std;
use dep::std::slice;
use std::println;


fn main(
    // use signature to never reveal private key, usefull to use external service like sindri
    signature: [u8; 64],
    signature_unique: [u8; 64],
    old_signature: [u8; 64],
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
    oldAmount: Field,
    witnesses: [[u8; 32]; 32],
    leafIndex: Field,
    actionIndex: Field,
    token: pub Field,
    // unique need to store stoken, action by token, to retrieve data from wallet
    unique: pub [u8; 32],
    // new leaf act as nullifer
    new_leaf: pub [u8; 32],
    merkleRoot: pub [u8; 32],
    amount: pub Field,
    amountRelayer: pub Field,
    receiver: pub Field,
    relayer: pub Field,
    isDeposit: pub [u8; 1],
    // call can't exceed 2048 bytes
    call: pub [u8; 2048]
) {
    // must be an action index > 0
    assert(actionIndex != 0);
    assert(amount != 0);
    assert(receiver != 0);
    if (relayer != 0) {
        assert(amountRelayer != 0);
    }

    let mut newAmount= 0;
    if isDeposit == [1] {
        let emptyCall :[u8; 2048] = [0; 2048];
        // we can't make call on deposit
        assert(emptyCall == call);
        // deposit add amount and substract relayer part
        newAmount = oldAmount + amount - amountRelayer;
    } else {
        // withdraw substract amount and  relayer part
        newAmount = oldAmount - amount - amountRelayer;
    }

    // new amount can't be negative (can't withdraw more than balance)
    assert((-1).lt(newAmount));

    let mut array_concat:([u8;160],[u8;128]) = concat_data(
        pub_key_x,
        pub_key_y,
        field_to_bytes(actionIndex),
        field_to_bytes(token),
        field_to_bytes(newAmount)
    );

    // use blake 3 to hash
    let hash_message:[u8;32] = std::hash::blake3(array_concat.0);
    let hash_unique:[u8;32] = std::hash::blake3(array_concat.1);

    // the user only need to sign with is private key to generate merkle leaf, so we never reveal private key
    let valid_signature = std::ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, signature, hash_message);
    assert(valid_signature);
    let valid_signature_unique = std::ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, signature_unique, hash_unique);
    assert(valid_signature_unique);

    // we use hash_signature so it will be difficult to guess the hash if we don'r have the private key to sign
    let hash_signature = std::hash::blake3(signature);
    let hash_signature_unique = std::hash::blake3(signature);

    // check new leaf match hash generated
    assert(new_leaf == hash_signature);
    assert(unique == hash_signature_unique);

    if (actionIndex == 1) {
        // the first deposit don't need to prove old actions
        // if first action so the previous balance is zero
        assert(oldAmount == 0);
    } else {
        let oldAction = actionIndex - 1;
        let mut old_data:([u8;160],[u8;128]) = concat_data(
            pub_key_x,
            pub_key_y,
            field_to_bytes(oldAction),
            field_to_bytes(token),
            field_to_bytes(oldAmount)
        );

        // use blake 3 to hash
        let old_data:[u8;32] = std::hash::blake3(array_concat.0);

        let valid_signature = std::ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, old_signature, old_data);
        assert(valid_signature);

        let old_leaf = std::hash::blake3(old_signature);

        let computed_root = compute_merkle_root(old_leaf, leafIndex, witnesses);
        assert(computed_root == merkleRoot);
    }
}

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
    token: [u8; 32],
    amount: [u8; 32]
) -> ([u8; 160], [u8; 128]) {
    let mut array_concat:[u8;160] = [0; 160];
    let mut array_unique:[u8;128]= [0; 128];

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
        } else if i < 128 {
            let index = i - 128;
            array_concat[i] = token[index];
            array_unique[i] = token[index];
        } else if i < 160 {
            let index = i - 160;
            array_concat[i] = amount[index];
        }
    }
    (array_concat, array_unique)
}

#[test]
fn test_hash() {
    let x = [
        102, 85, 254, 237, 77, 33, 76, 38, 30, 10, 107, 85,
        67, 149, 89, 111, 31, 20, 118, 167, 125, 153, 149, 96,
        229, 168, 223, 155, 138, 26, 53, 21, 33, 126, 136, 221,
        5, 233, 56, 239, 221, 113, 178, 204, 227, 34, 191, 1,
        218, 150, 205, 66, 8, 123, 35, 110, 143, 80, 67, 21,
        122, 156, 6, 142, 1, 0, 0, 0, 0, 0, 0, 0,
        232, 3, 0, 0, 0, 0, 0, 0
    ];
    let std::hash::blake3 = main(x);
    println("hash result");
    println(res);
}
