use dep::std;
use dep::std::slice;

fn main(
    // use signature to never reveal private key, usefull to use external service like sindri
    signature: [u8; 64],
    signature_unique: [u8; 64],
    old_signature: [u8; 64],
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
    old_amount: Field,
    // size 16, bigger array failed to prove in js
    witnesses: [[u8; 32]; 16],
    leaf_index: Field,
    action_index: Field,
    token: pub Field,
    // unique need to store stoken, action by token, to retrieve data from wallet
    unique: pub [u8; 32],
    // new leaf act as nullifer
    new_leaf: pub [u8; 32],
    merkle_root: pub [u8; 32],
    amount: pub Field,
    amount_relayer: pub Field,
    receiver: pub Field,
    relayer: pub Field,
    is_deposit: pub [u8; 1],
    approve: pub [u8; 1],
    // hash of call
    call: pub [u8; 32]
) {
    // must be an action index > 0
    assert(action_index != 0);
    assert(amount != 0);
    assert(receiver != 0);
    if (relayer != 0) {
        assert(amount_relayer != 0);
    }
    let mut newAmount= 0;
    if is_deposit == [1] {
        let emptyCall :[u8; 32] = [0; 32];
        // we can't make call on deposit
        assert(emptyCall == call);
        // no approve on deposit
        assert(approve == [0]);
        // deposit add amount and substract relayer part
        newAmount = old_amount + amount - amount_relayer;
    } else {
        // withdraw substract amount and  relayer part
        newAmount = old_amount - amount - amount_relayer;
    }

    let amountAfter = U128::from_integer(newAmount);
    let zero = U128::from_integer(0);
    // new amount can't be negative (can't withdraw more than balance)
    assert(amountAfter >= zero, "Amount can't be negative");

    // use blake 3 to hash
    let hash_message:[u8;32] = get_leaf_hash(
        pub_key_x,
        pub_key_y,
        field_to_bytes(action_index),
        field_to_bytes(token),
        field_to_bytes(newAmount)
    );
    let hash_unique:[u8;32] = get_unique_hash(
        pub_key_x,
        pub_key_y,
        field_to_bytes(action_index),
        field_to_bytes(token)
    );

    // the user only need to sign with is private key to generate merkle leaf, so we never reveal private key
    let valid_signature = std::ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, signature, hash_message);
    assert(valid_signature);
    let valid_signature_unique = std::ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, signature_unique, hash_unique);
    assert(valid_signature_unique);

    // we use hash_signature so it will be difficult to guess the hash if we don'r have the private key to sign
    let hash_signature = std::hash::blake3(signature);
    let hash_signature_unique = std::hash::blake3(signature_unique);

    // check new leaf match hash generated
    assert(new_leaf == hash_signature);
    assert(unique == hash_signature_unique);

    if (action_index == 1) {
        // the first deposit don't need to prove old actions
        // if first action so the previous balance is zero
        assert(old_amount == 0);
    } else {
        let oldAction = action_index - 1;
        // use blake 3 to hash
        let old_data:[u8;32] = get_leaf_hash(
            pub_key_x,
            pub_key_y,
            field_to_bytes(oldAction),
            field_to_bytes(token),
            field_to_bytes(old_amount)
        );
        let valid_old_signature = std::ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, old_signature, old_data);
        assert(valid_old_signature, "Invalid old signature");
        let old_leaf = std::hash::blake3(old_signature);
        let computed_root = compute_merkle_root(old_leaf, leaf_index, witnesses);
        assert(computed_root == merkle_root);
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
    }
    current
}

fn field_to_bytes(input: Field) -> [u8; 32] {
    let input_to_bytes:[u8] = input.to_be_bytes(32);
    let mut result :[u8;32] = [0; 32];
    for i in 0..32 {
        result[i] = input_to_bytes[i];
    }
    result
}

fn get_leaf_hash(
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
    action_index: [u8; 32],
    token: [u8; 32],
    amount: [u8; 32]
) -> [u8; 32] {
    let mut array_concat:[u8;160] = [0; 160];

    for i in 0..32 {
        array_concat[i] = pub_key_x[i];
        array_concat[i+32] = pub_key_y[i];
        array_concat[i+64] = action_index[i];
        array_concat[i+96] = token[i];
        array_concat[i+128] = amount[i];
    }
    std::hash::blake3(array_concat)
}

fn get_unique_hash(pub_key_x: [u8; 32], pub_key_y: [u8; 32], action_index: [u8; 32], token: [u8; 32]) -> [u8; 32] {
    let mut array_concat:[u8;128] = [0; 128];

    for i in 0..32 {
        array_concat[i] = pub_key_x[i];
        array_concat[i+32] = pub_key_y[i];
        array_concat[i+64] = action_index[i];
        array_concat[i+96] = token[i];
    }
    std::hash::blake3(array_concat)
}

