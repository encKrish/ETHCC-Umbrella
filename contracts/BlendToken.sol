// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

// !!! Only works on Ropsten
// TODO USDC has only 6 decimals, will need to change a lot of code

// include Chain interface from Umbrella SDK
import "@umb-network/toolbox/dist/contracts/IChain.sol";
import "@umb-network/toolbox/dist/contracts/IRegistry.sol";
import "@umb-network/toolbox/dist/contracts/lib/ValueDecoder.sol";

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BlendToken is ERC20, ERC20Burnable {
    using ValueDecoder for bytes;

    event newBlendCreated(bytes32 tokenA, bytes32 tokenB, uint8 pricingMode, uint _shareA, address contractAdx);
    // TODO L2 Data cannot be accessed on chain, so emit events for the user to verify

    // registry wit all contract addresses, most important is `Chain`
    IRegistry public registry;
    IChain chain;
    // USDC on Ropsten. Change address for different network
    IERC20 USDC = IERC20(0x07865c6E87B9F70255377e024ace6630C1Eaa37F);
    // Fee reciever is set before deploying, currently only a placeholder
    address FEE_RECIEVER = 0x4c46ACaCeE99F43c2A757aAC658435019Fa839e4;

    bytes32 tokenA;
    bytes32 tokenB;
    uint8 public pricingMode;
    // shareA is used only when the pricing mode is set to 3
    // it is a 4 digit number ranging from 0001 to 9999
    // 0001 = 0.01%     9999 = 99.99%
    uint shareA;


    // !!!!! TESTING CODE FOR POOL
    struct TokenSellers {
        address adx;
        uint amount;
        uint remAmount;
    }

    mapping(uint => TokenSellers) private mapSellers;
    uint private currSellerIdx;
    uint private totalSellers;


    // get registry contract address from trusted source
    constructor(string memory _name,
                bytes32 _tokenA,
                bytes32 _tokenB, 
                uint8 _pricingMode,
                uint _shareA,
                address _registry
    ) ERC20(_name, _name) {
        require(_registry != address(0x0), "_registry is empty");
        require((_shareA > 0) && (_shareA < 10000), "share percent out of bounds");

        registry = IRegistry(_registry);
        chain = IChain(registry.requireAndGetAddress("Chain"));

        tokenA = _tokenA;
        tokenB = _tokenB;
        pricingMode = _pricingMode;
        shareA = _shareA;
        
        emit newBlendCreated(_tokenA, _tokenB, _pricingMode, shareA, address(this));
    }

    function getPriceOfUnderlying(bytes32 _key) public view returns (uint256) {
        // _key is of the following format:
        // for currency pairs it is CURR-USD
        // for stocks it is EQ:STOC

        (uint256 value, uint256 timestamp) = chain.getCurrentValue(_key);

        require(timestamp > 0, "value does not exists");
        return value;
    }

    function getPrice() public view returns(uint) {
        if (pricingMode == uint8(1))
            return _pricing_1();
        else if (pricingMode == uint8(2))
            return _pricing_2();
        else return _pricing_3();
    }

    //********************************************************
    // Pricing Computers
    //********************************************************

    // TODO
    function _pricing_1() private view returns(uint) {return shareA;}

    function _pricing_2() private view returns(uint) {
        return getPriceOfUnderlying(tokenA) * getPriceOfUnderlying(tokenB);
    }

    function _pricing_3() private view returns(uint) {
        uint _tokenAPrice = (getPriceOfUnderlying(tokenA) * shareA) / 10000; 
        uint _tokenBPrice = (getPriceOfUnderlying(tokenB) * (10000 - shareA)) / 10000; 

        return _tokenAPrice + _tokenBPrice;
    }

    //********************************************************
    // Transaction functions
    //********************************************************
    function getTransferrableAmount(address reciever) public view returns(uint amountToTransfer, uint approvedAmount) {
        approvedAmount = USDC.allowance(reciever, address(this));
        amountToTransfer = (approvedAmount * 10**decimals()) / getPrice();
        if (pricingMode == 2) {
            amountToTransfer = (approvedAmount * 10**(2 * decimals())) / getPrice();
        }

        return (amountToTransfer, approvedAmount);
    } 

    function _mintBlendTokens(address reciever) private {
        (uint amountToTransfer, uint approvedAmount) = getTransferrableAmount(reciever);
        USDC.transferFrom(reciever, FEE_RECIEVER, approvedAmount);

        _mint(reciever, amountToTransfer);
    }

    // !!!! TESTING CODE FOR SELLING 
    function sellersAvailable() public view returns(bool) {
        if (currSellerIdx > totalSellers)
            return false;
        else return true;
    }

    function _buyBlendTokensFromPool(address reciever, uint amount) private {
        // ! Only execute after checking sellersAvailable()
        while(currSellerIdx <= totalSellers) {
            address seller = mapSellers[currSellerIdx].adx;
            uint remAmount = mapSellers[currSellerIdx].remAmount;
            uint iterAmount = amount < remAmount ? amount : remAmount;

            // Transfer Blend tokens from seller to reciever
            transferFrom(mapSellers[currSellerIdx].adx, reciever, iterAmount);

            // Transfer USDC to from reciever to seller
            USDC.transferFrom(reciever, seller, (getPrice() * amount)/10**decimals());

            mapSellers[currSellerIdx].remAmount -= iterAmount;
            amount -= iterAmount;

            if (mapSellers[currSellerIdx].remAmount <= 0) 
                currSellerIdx++;

            if (amount <= 0)
                break;
        }

        if (amount > 0) 
            _mintBlendTokens(reciever);
    }

    function buyBlendTokens(address reciever) public {
        (uint amountToTransfer, ) = getTransferrableAmount(reciever);

        if (sellersAvailable()) {
            _buyBlendTokensFromPool(reciever, amountToTransfer);
        } else _mintBlendTokens(reciever);
    }

    function sellToPool(address sender, uint amount) public {
        // TODO Check approve once
        _approve(sender, address(this), amount);
        totalSellers++;
        mapSellers[totalSellers] = TokenSellers(sender, amount, amount);
    }
}