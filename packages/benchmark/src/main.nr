use dep::std;
use dep::std::slice;
use std::println;

fn main(x: [u8; 32], algo: Field) -> pub [u8; 32] {
    let mut arr:[u8;32]= [0; 32];
    // for i in 0..32 {
    //     arr[i] = x[i];
    //     arr[i+32]=y[i];
    // }
    let hash_path :[[u8;32];32]= [x; 32];
    if (algo == 1) {
        for index in 0..32 {
            arr = std::hash::sha256(x);
            arr[index] = 0;
        }
    } else if algo == 2 {
        for index in 0..32 {
            arr = std::hash::blake2s(x);
            arr[index] = 0;
        }
    } else if algo == 2 {
        for index in 0..32 {
            arr = std::hash::blake2s(x);
            arr[index] = 0;
        }
    } else if algo == 3 {
        for index in 0..32 {
            arr = std::hash::blake3(x);
            arr[index] = 0;
        }
    } else if algo == 4 {
        arr = compute_merkle_root(x, 16, hash_path);
    }

    arr
}

// update of noir implementation to use poseidon
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
        current = std::hash::keccak256(arr,32);
        //std::println("current");
        //std::println(current);
    }
    current
}

#[test]
fn test_sha() {
    let x = [
        131, 24, 83, 91, 84, 16, 93, 74, 122, 174, 96, 192, 143, 196, 95, 150, 135, 24, 27, 79, 223, 198, 37, 189, 26, 117, 63, 167, 57, 127, 237, 117
    ];
    // let y = [
    //     53, 71, 241, 28, 168, 105, 102, 70, 242, 243, 172, 176, 142, 49, 1, 106, 250, 194, 62, 99, 12, 93, 17, 245, 159, 97, 254, 245, 123, 13, 42, 165
    // ];
    let res= main(x, 1);
    println("sha result");
    println(res);
}

#[test]
fn test_blake2() {
    let x = [
        131, 24, 83, 91, 84, 16, 93, 74, 122, 174, 96, 192, 143, 196, 95, 150, 135, 24, 27, 79, 223, 198, 37, 189, 26, 117, 63, 167, 57, 127, 237, 117
    ];
    // let y = [
    //     53, 71, 241, 28, 168, 105, 102, 70, 242, 243, 172, 176, 142, 49, 1, 106, 250, 194, 62, 99, 12, 93, 17, 245, 159, 97, 254, 245, 123, 13, 42, 165
    // ];
    let res = main(x, 2);
    println("blake2 result");
    println(res);
}

#[test]
fn test_blake3() {
    let x = [
        131, 24, 83, 91, 84, 16, 93, 74, 122, 174, 96, 192, 143, 196, 95, 150, 135, 24, 27, 79, 223, 198, 37, 189, 26, 117, 63, 167, 57, 127, 237, 117
    ];
    // let y = [
    //     53, 71, 241, 28, 168, 105, 102, 70, 242, 243, 172, 176, 142, 49, 1, 106, 250, 194, 62, 99, 12, 93, 17, 245, 159, 97, 254, 245, 123, 13, 42, 165
    // ];
    let res = main(x, 3);
    println("blake3 result");
    println(res);
}

#[test]
fn test_keccak() {
    let x = [
        131, 24, 83, 91, 84, 16, 93, 74, 122, 174, 96, 192, 143, 196, 95, 150, 135, 24, 27, 79, 223, 198, 37, 189, 26, 117, 63, 167, 57, 127, 237, 117
    ];
    // let y = [
    //     53, 71, 241, 28, 168, 105, 102, 70, 242, 243, 172, 176, 142, 49, 1, 106, 250, 194, 62, 99, 12, 93, 17, 245, 159, 97, 254, 245, 123, 13, 42, 165
    // ];
    let res = main(x, 4);
    println("keccak result");
    println(res);
}
