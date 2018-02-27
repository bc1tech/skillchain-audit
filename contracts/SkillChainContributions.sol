pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract SkillChainContributions is Ownable {
    using SafeMath for uint256;

    mapping(address => uint256) public tokenBalances;
    address[] public addresses;

    function SkillChainContributions() public {}

    function addBalance(address _address, uint256 _tokenAmount) onlyOwner public {
        require(_tokenAmount > 0);

        if (tokenBalances[_address] == 0) {
            addresses.push(_address);
        }
        tokenBalances[_address] = tokenBalances[_address].add(_tokenAmount);
    }

    function getContributorsLength() view public returns (uint) {
        return addresses.length;
    }
}
