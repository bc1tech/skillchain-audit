pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "./ApproveAndCallFallBack.sol";


contract SkillChainToken is DetailedERC20, MintableToken, BurnableToken {

    modifier canTransfer() {
        require(mintingFinished);
        _;
    }

    function SkillChainToken() DetailedERC20("Skillchain", "SKI", 18) public {}

    function transfer(address _to, uint _value) canTransfer public returns (bool) {
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint _value) canTransfer public returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }

    function approveAndCall(address _spender, uint256 _tokens, bytes _data) public returns (bool success) {
        approve(_spender, _tokens);
        ApproveAndCallFallBack(_spender).receiveApproval(
            msg.sender,
            _tokens,
            this,
            _data
        );
        return true;
    }

    function transferAnyERC20Token(address _tokenAddress, uint256 _tokens) onlyOwner public returns (bool success) {
        return ERC20Basic(_tokenAddress).transfer(owner, _tokens);
    }
}
