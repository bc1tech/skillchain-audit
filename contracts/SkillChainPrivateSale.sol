pragma solidity ^0.4.19;

import "./SkillChainContributions.sol";
import "./SkillChainToken.sol";
import "zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol";


contract SkillChainPrivateSale is CappedCrowdsale, Ownable {

    SkillChainContributions public contributions;

    uint256 public minimumContribution = 2 ether;

    function SkillChainPrivateSale(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _rate,
        address _wallet,
        uint256 _cap
    )
    CappedCrowdsale(_cap)
    Crowdsale(_startTime, _endTime, _rate, _wallet)
    public
    {
        contributions = new SkillChainContributions();
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

    // close private sale and transfer token ownership to the presale contract
    function closeTokenSale(address _presaleContract) onlyOwner public {
        require(hasEnded());
        require(_presaleContract != address(0));

        token.transferOwnership(_presaleContract);
        contributions.transferOwnership(_presaleContract);
    }

    function transferAnyERC20Token(address _tokenAddress, uint256 _tokens) onlyOwner public returns (bool success) {
        return ERC20Basic(_tokenAddress).transfer(owner, _tokens);
    }

    /**
     * @dev Create new instance of token contract
     */
    function createTokenContract() internal returns (MintableToken) {
        return new SkillChainToken();
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
