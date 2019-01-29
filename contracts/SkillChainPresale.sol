pragma solidity ^0.4.19;

import "./SkillChainContributions.sol";
import "./SkillChainToken.sol";
import "zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol";


contract SkillChainPresale is CappedCrowdsale, Ownable {

    SkillChainContributions public contributions;

    uint256 public minimumContribution = 1 ether;

    function SkillChainPresale(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _rate,
        address _wallet,
        uint256 _cap,
        address _token,
        address _contributions
    )
    CappedCrowdsale(_cap)
    Crowdsale(_startTime, _endTime, _rate, _wallet)
    public
    {
        token = SkillChainToken(_token);
        contributions = SkillChainContributions(_contributions);
    }

    // low level token purchase function
    function buyTokens(address beneficiary) public payable {
        require(beneficiary != address(0));
        require(validPurchase());

        uint256 weiAmount = msg.value;

        // calculate token amount to be created
        uint256 tokens = getTokenAmount(weiAmount);

        // update state
        weiRaised = weiRaised.add(weiAmount);

        token.mint(beneficiary, tokens);
        TokenPurchase(
            msg.sender,
            beneficiary,
            weiAmount,
            tokens
        );

        forwardFunds();

        // log contribution
        contributions.addBalance(beneficiary, tokens);
    }

    // close presale and transfer token ownership to the presale contract
    function closeTokenSale(address _icoContract) onlyOwner public {
        require(hasEnded());
        require(_icoContract != address(0));

        token.transferOwnership(_icoContract);
        contributions.transferOwnership(_icoContract);
    }

    function transferAnyERC20Token(address _tokenAddress, uint256 _tokens) onlyOwner public returns (bool success) {
        return ERC20Basic(_tokenAddress).transfer(owner, _tokens);
    }

    // false if the ico is not started, true if the ico is started and running, true if the ico is completed
    function started() public view returns(bool) {
        return now >= startTime;
    }

    // false if the ico is not started, false if the ico is started and running, true if the ico is completed
    function ended() public view returns(bool) {
        return hasEnded();
    }

    // returns the total number of the tokens available for the sale, must not change when the ico is started
    function totalTokens() public view returns(uint) {
        return rate.mul(cap);
    }

    // returns the number of the tokens available for the ico.
    // At the moment that the ico starts it must be equal to totalTokens(),
    // then it will decrease. It is used to calculate the percentage of sold tokens as remainingTokens() / totalTokens()
    function remainingTokens() public view returns(uint) {
        return rate.mul(cap).sub(rate.mul(weiRaised));
    }

    // return the price as number of tokens released for each ether
    function price() public view returns(uint) {
        return rate;
    }

    /**
     * @dev Create new instance of token contract
     */
    function createTokenContract() internal returns (MintableToken) {
        return MintableToken(0);
    }

    // overriding CappedCrowdsale#validPurchase to add extra cap logic
    // @return true if investors are sending more than minimum contribution
    function validPurchase() internal view returns (bool) {
        bool validContribution = msg.value >= minimumContribution;

        uint256 remainingBalance = cap.sub(weiRaised);
        if (remainingBalance <= minimumContribution) {
            validContribution = true;
        }

        return validContribution && super.validPurchase();
    }
}
