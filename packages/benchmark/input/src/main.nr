// verifies that if a parameter, even if not used by the proof, cannot diverge during verification
fn main(x: Field, y: pub Field) {
    assert(0.lt(x));
}

#[test]
fn test_main() {
    main(1, 2);
    // Uncomment to make test fail
    // main(1, 1);
}
