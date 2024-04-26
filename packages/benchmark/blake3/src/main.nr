use dep::std;
use dep::std::slice;
use std::println;

fn main(x: [u8; 32]) -> pub [u8; 32] {
    let hash_path :[[u8;32];32]= [x; 32];
    compute_merkle_root(x, 16, hash_path)
}

#[test]
fn test_blake3() {
    let x = [
        102, 85, 254, 237, 77, 33, 76, 38, 30, 10, 107, 85,
        67, 149, 89, 111, 31, 20, 118, 167, 125, 153, 149, 96,
        229, 168, 223, 155, 138, 26, 53, 21, 33, 126, 136, 221,
        5, 233, 56, 239, 221, 113, 178, 204, 227, 34, 191, 1,
        218, 150, 205, 66, 8, 123, 35, 110, 143, 80, 67, 21,
        122, 156, 6, 142, 1, 0, 0, 0, 0, 0, 0, 0,
        232, 3, 0, 0, 0, 0, 0, 0
    ];
    let res = std::hash::blake3(x);
    println("hash result");
    println(res);
}

#[test]
fn test_sign() {
    let x = [
        102, 85, 254, 237, 77, 33, 76, 38, 30, 10, 107, 85,
        67, 149, 89, 111, 31, 20, 118, 167, 125, 153, 149, 96,
        229, 168, 223, 155, 138, 26, 53, 21, 33, 126, 136, 221,
        5, 233, 56, 239, 221, 113, 178, 204, 227, 34, 191, 1,
        218, 150, 205, 66, 8, 123, 35, 110, 143, 80, 67, 21,
        122, 156, 6, 142, 1, 0, 0, 0, 0, 0, 0, 0,
        232, 3, 0, 0, 0, 0, 0, 0
    ];
    let signature = [
        242, 41, 66, 130, 223, 235, 0, 57, 138, 12, 177,
        226, 157, 63, 173, 180, 84, 6, 158, 59, 208, 205,
        26, 31, 47, 40, 193, 175, 197, 232, 97, 174, 70,
        154, 179, 84, 159, 177, 171, 176, 157, 114, 206, 56,
        214, 177, 230, 197, 238, 144, 11, 22, 217, 107, 216,
        203, 133, 95, 191, 39, 166, 207, 92, 45
    ];
    let pub_key_x= [
        102, 85, 254, 237, 77, 33, 76, 38,
        30, 10, 107, 85, 67, 149, 89, 111,
        31, 20, 118, 167, 125, 153, 149, 96,
        229, 168, 223, 155, 138, 26, 53, 21
    ];
    let pub_key_y = [
        33, 126, 136, 221, 5, 233, 56, 239,
        221, 113, 178, 204, 227, 34, 191, 1,
        218, 150, 205, 66, 8, 123, 35, 110,
        143, 80, 67, 21, 122, 156, 6, 142
    ];
    let res = std::hash::blake3(x);
    let valid_signature = std::ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, signature, res);
    assert(valid_signature);
    println("hash result");
    println(res);
}

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
        current =  std::hash::blake3(arr);
    }
    current
}
