// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EtherWallet {
    address payable public owner;

    modifier onlyOwner {
        require(msg.sender == owner,'Sender is not the owner');
        _;        
    }
    constructor()  {
        owner = payable(msg.sender);
    }

    
    function  deposit() payable public  {}  
    
    function withdraw(address payable _receiver, uint _amount) onlyOwner public {
        require(address(this).balance >= _amount, 'Not enough funds');

        
        (bool success, bytes memory data) = _receiver.call{value: _amount}(
            abi.encodeWithSignature("doesNotExist()")
        );

        emit withdrawResult(success, _receiver, _amount);
    }
    function balanceOf() view public returns(uint) {
        return address(this).balance;
    }

    // * receive function
    receive() external payable {}

    // * fallback function
    fallback() external payable {}

    event withdrawResult(bool indexed success, address indexed receiver, uint indexed amount);
}
