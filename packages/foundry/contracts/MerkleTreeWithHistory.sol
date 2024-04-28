// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

// inspired from the tornade
contract MerkleTreeWithHistory {
    uint32 public levels;

    // the following variables are made public for easier testing and debugging and
    // are not supposed to be accessed in regular code

    // filledSubtrees and roots could be bytes32[size], but using mappings makes it cheaper because
    // it removes index range check on every interaction
    mapping(uint256 => bytes32) public filledSubtrees;
    mapping(uint256 => bytes32) public roots;
    uint32 public constant ROOT_HISTORY_SIZE = 30;
    uint32 public currentRootIndex = 0;
    uint32 public nextIndex = 0;

    constructor(uint32 _levels) {
        require(_levels > 0, "_levels should be greater than zero");
        require(_levels < 32, "_levels should be less than 32");
        levels = _levels;

        for (uint32 i = 0; i < _levels; i++) {
            filledSubtrees[i] = zeros(i);
        }

        roots[0] = zeros(_levels - 1);
    }

    /**
    @dev Hash 2 tree leaves
    */
    function hashLeftRight(
        bytes32 _left,
        bytes32 _right
    ) public view returns (bytes32 value) {
        bytes memory data = abi.encode(_left, _right);
        value = sha256(data);
    }

    function _insert(bytes32 _leaf) internal returns (uint32 index) {
        uint32 _nextIndex = nextIndex;
        require(
            _nextIndex != uint32(2) ** levels,
            "Merkle tree is full. No more leaves can be added"
        );
        uint32 currentIndex = _nextIndex;
        bytes32 currentLevelHash = _leaf;
        bytes32 left;
        bytes32 right;

        for (uint32 i = 0; i < levels; i++) {
            if (currentIndex % 2 == 0) {
                left = currentLevelHash;
                right = zeros(i);
                filledSubtrees[i] = currentLevelHash;
            } else {
                left = filledSubtrees[i];
                right = currentLevelHash;
            }
            currentLevelHash = hashLeftRight(left, right);
            currentIndex /= 2;
        }

        uint32 newRootIndex = (currentRootIndex + 1) % ROOT_HISTORY_SIZE;
        currentRootIndex = newRootIndex;
        roots[newRootIndex] = currentLevelHash;
        nextIndex = _nextIndex + 1;
        return _nextIndex;
    }

    /**
    @dev Whether the root is present in the root history
  */
    function isKnownRoot(bytes32 _root) public view returns (bool) {
        if (_root == 0) {
            return false;
        }
        uint32 _currentRootIndex = currentRootIndex;
        uint32 i = _currentRootIndex;
        do {
            if (_root == roots[i]) {
                return true;
            }
            if (i == 0) {
                i = ROOT_HISTORY_SIZE;
            }
            i--;
        } while (i != _currentRootIndex);
        return false;
    }

    /**
    @dev Returns the last root
  */
    function getLastRoot() public view returns (bytes32) {
        return roots[currentRootIndex];
    }

    /// @dev provides Zero (Empty) elements for a poseidon MerkleTree based on sha256
    function zeros(uint256 i) public pure returns (bytes32) {
        if (i == 0) return bytes32(0);
        else if (i == 1)
            return
                bytes32(
                    0xf5a5fd42d16a20302798ef6ed309979b43003d2320d9f0e8ea9831a92759fb4b
                );
        else if (i == 2)
            return
                bytes32(
                    0xdb56114e00fdd4c1f85c892bf35ac9a89289aaecb1ebd0a96cde606a748b5d71
                );
        else if (i == 3)
            return
                bytes32(
                    0xc78009fdf07fc56a11f122370658a353aaa542ed63e44c4bc15ff4cd105ab33c
                );
        else if (i == 4)
            return
                bytes32(
                    0x536d98837f2dd165a55d5eeae91485954472d56f246df256bf3cae19352a123c
                );
        else if (i == 5)
            return
                bytes32(
                    0x9efde052aa15429fae05bad4d0b1d7c64da64d03d7a1854a588c2cb8430c0d30
                );
        else if (i == 6)
            return
                bytes32(
                    0xd88ddfeed400a8755596b21942c1497e114c302e6118290f91e6772976041fa1
                );
        else if (i == 7)
            return
                bytes32(
                    0x87eb0ddba57e35f6d286673802a4af5975e22506c7cf4c64bb6be5ee11527f2c
                );
        else if (i == 8)
            return
                bytes32(
                    0x26846476fd5fc54a5d43385167c95144f2643f533cc85bb9d16b782f8d7db193
                );
        else if (i == 9)
            return
                bytes32(
                    0x506d86582d252405b840018792cad2bf1259f1ef5aa5f887e13cb2f0094f51e1
                );
        else if (i == 10)
            return
                bytes32(
                    0xffff0ad7e659772f9534c195c815efc4014ef1e1daed4404c06385d11192e92b
                );
        else if (i == 11)
            return
                bytes32(
                    0x6cf04127db05441cd833107a52be852868890e4317e6a02ab47683aa75964220
                );
        else if (i == 12)
            return
                bytes32(
                    0xb7d05f875f140027ef5118a2247bbb84ce8f2f0f1123623085daf7960c329f5f
                );
        else if (i == 13)
            return
                bytes32(
                    0xdf6af5f5bbdb6be9ef8aa618e4bf8073960867171e29676f8b284dea6a08a85e
                );
        else if (i == 14)
            return
                bytes32(
                    0xb58d900f5e182e3c50ef74969ea16c7726c549757cc23523c369587da7293784
                );
        else if (i == 15)
            return
                bytes32(
                    0xd49a7502ffcfb0340b1d7885688500ca308161a7f96b62df9d083b71fcc8f2bb
                );
        else if (i == 16)
            return
                bytes32(
                    0x8fe6b1689256c0d385f42f5bbe2027a22c1996e110ba97c171d3e5948de92beb
                );
        else revert("Index out of bounds");
    }
}
