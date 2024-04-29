use dep::std;
use dep::std::slice;
use std::println;

fn main(x: [u8; 32]) -> pub [u8; 32] {
    let hash_path :[[u8;32];32]= [x; 32];
    compute_merkle_root(x, 16, hash_path)
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
        current =  std::hash::sha256(arr);
    }
    current
}

#[test]
fn test_hash() {
    let x = [
        131, 24, 83, 91, 84, 16, 93, 74, 122, 174, 96, 192, 143, 196, 95, 150, 135, 24, 27, 79, 223, 198, 37, 189, 26, 117, 63, 167, 57, 127, 237, 117
    ];
    let res= main(x);
    println("hash result");
    println(res);
}

#[test]
fn test_hash_zero() {
    let x = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];
    let res= std::hash::sha256(x);
    println("hash two bytes32 of 0");
    println(res);
}

#[test]
fn test_bytes() {
    let x = 0x000000000000000000000000000000000000000000000000002386f26fc10000;
    let res= field_to_bytes(x);
    println("field_to_bytes 0.01 eth");
    println(res);
}

fn field_to_bytes(input: Field) -> [u8; 32] {
    let input_to_bytes:[u8] = input.to_be_bytes(32);
    let mut result :[u8;32] = [0; 32];
    for i in 0..32 {
        result[i] = input_to_bytes[i];
    }
    result
}
