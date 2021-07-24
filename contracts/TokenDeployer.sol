// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;


import {BlendToken} from "./BlendToken.sol";

contract TokenDeployer {
    // struct TokenPair {
    //     bytes32 tokenA;
    //     bytes32 tokenB;
    //     uint8 pricingMode;
    // }

    mapping(bytes32 => address) hashToContract;

    function createNewBlend(bytes32 _tokenA, 
                            bytes32 _tokenB, 
                            uint8 _pricingMode, 
                            uint shareA,
                            bytes memory _id, 
                            address registry
        ) public {
        // id is the concatenation of tokenA+tokenB+pricingMode
        // 
        // AAPLETHx (second mode), alphabetically first comes first
        // or AAPL25ETH75 (third mode), 25% AAPL + 75% ETH

        BlendToken token = new BlendToken(string(_id), _tokenA, _tokenB, _pricingMode, shareA, registry);
        hashToContract[keccak256(_id)] = address(token);
    }


}
