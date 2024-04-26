# benchmark

Result on WSL with Ryzen 7950X

keccak 0m13.477s

sha 0m3.443s (seems the most interesting for solidity)

blake2 0m1.915s

blake3 0m1.879s

## input
verifies that if a parameter, even if not used by the proof, cannot diverge during verification

Verifier.toml for success verification
```sh
nargo verify
```

VerificationFail.toml for failure verification
```sh
nargo verify -v VerifierFail.toml
```