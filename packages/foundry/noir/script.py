#! /usr/bin/env python
import os
from sindri.sindri import Sindri  # pip install sindri

# Obtain your API Key from an environment variable
API_KEY = os.getenv("SINDRI_API_KEY", "")
sindri = Sindri(API_KEY)
sindri.set_verbose_level(1)  # Enable verbose stdout

# Prove the circuit
proof_input_file_path = "./Prover.toml"
with open(proof_input_file_path, "r") as f:
    proof_id = sindri.prove_circuit("pi-wallet", f.read())