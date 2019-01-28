import ether from './helpers/ether';
import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import latestTime from './helpers/latestTime';
import EVMRevert from './helpers/EVMRevert';

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const SkillChainToken = artifacts.require('SkillChainToken');
const SkillChainPrivateSale = artifacts.require('SkillChainPrivateSale');
const SkillChainPresale = artifacts.require('SkillChainPresale');
const SkillChainContributions = artifacts.require('SkillChainContributions');

contract('SkillChainPresale', function ([_, investor, wallet, purchaser, nextCrowdsaleAddress]) {
  const rate = new BigNumber(5000);

  const cap = ether(5);
  const lessThanCap = ether(3);
  const minimumContribution = ether(1);
  const value = minimumContribution;

  const expectedTokenAmount = rate.mul(value);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.previousStartTime = latestTime() + duration.weeks(1);
    this.previousEndTime = this.previousStartTime + duration.weeks(1);
    this.previousAfterEndTime = this.previousEndTime + duration.seconds(1);
    this.previousSale = await SkillChainPrivateSale.new(
      this.previousStartTime,
      this.previousEndTime,
      rate,
      wallet,
      cap
    );

    this.token = SkillChainToken.at(await this.previousSale.token());
    this.contributions = SkillChainContributions.at(await this.previousSale.contributions());

    this.startTime = this.previousEndTime + duration.weeks(1);
    this.endTime = this.startTime + duration.weeks(1);
    this.afterEndTime = this.endTime + duration.seconds(1);
    this.crowdsale = await SkillChainPresale.new(
      this.startTime,
      this.endTime,
      rate,
      wallet,
      cap,
      this.token.address,
      this.contributions.address
    );

    await increaseTimeTo(this.previousAfterEndTime);
    await this.previousSale.closeTokenSale(this.crowdsale.address);
  });

  it('should be token owner', async function () {
    const owner = await this.token.owner();
    owner.should.equal(this.crowdsale.address);
  });

  describe('creating a valid crowdsale', function () {
    it('should fail with start time in the past', async function () {
      await SkillChainPresale.new(
        latestTime() - duration.days(1),
        this.endTime,
        rate,
        wallet,
        cap,
        this.token.address,
        this.contributions.address).should.be.rejectedWith(EVMRevert);
    });

    it('should fail with end time before start time', async function () {
      await SkillChainPresale.new(
        this.startTime,
        this.startTime - duration.days(1),
        rate,
        wallet,
        cap,
        this.token.address,
        this.contributions.address).should.be.rejectedWith(EVMRevert);
    });

    it('should fail with zero rate', async function () {
      await SkillChainPresale.new(
        this.startTime,
        this.endTime,
        0,
        wallet,
        cap,
        this.token.address,
        this.contributions.address).should.be.rejectedWith(EVMRevert);
    });

    it('should fail with 0x0 wallet', async function () {
      await SkillChainPresale.new(
        this.startTime,
        this.endTime,
        rate,
        0x0,
        cap,
        this.token.address,
        this.contributions.address).should.be.rejectedWith(EVMRevert);
    });

    it('should fail with zero cap', async function () {
      await SkillChainPresale.new(
        this.startTime,
        this.endTime,
        rate,
        wallet,
        0,
        this.token.address,
        this.contributions.address).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('accepting payments', function () {
    it('should reject payments before start', async function () {
      await this.crowdsale.send(value).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(investor, { from: purchaser, value: value }).should.be.rejectedWith(EVMRevert);
    });

    it('should accept payments after start', async function () {
      await increaseTimeTo(this.startTime);
      await this.crowdsale.send(value).should.be.fulfilled;
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled;
    });

    it('should reject payments after end', async function () {
      await increaseTimeTo(this.afterEndTime);
      await this.crowdsale.send(value).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments if beneficiary is the zero address', async function () {
      await increaseTimeTo(this.startTime);
      await this.crowdsale.buyTokens(0x0, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
    });

    it('should accept payments within cap', async function () {
      await increaseTimeTo(this.startTime);
      await this.crowdsale.send(cap.minus(lessThanCap)).should.be.fulfilled;
      await this.crowdsale.send(lessThanCap).should.be.fulfilled;
    });

    it('should reject payments outside cap', async function () {
      await increaseTimeTo(this.startTime);
      await this.crowdsale.send(cap);
      await this.crowdsale.send(1).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments less than minimum contribution', async function () {
      await increaseTimeTo(this.startTime);
      await this.crowdsale.send(minimumContribution.minus(1)).should.be.rejectedWith(EVMRevert);
    });

    it('should accept payments less than minimum contribution only if less token remaining', async function () {
      await increaseTimeTo(this.startTime);
      await this.crowdsale.send(cap.minus(minimumContribution).plus(1)).should.be.fulfilled;
      await this.crowdsale.send(minimumContribution.minus(1)).should.be.fulfilled;
    });

    it('should reject payments that exceed cap', async function () {
      await increaseTimeTo(this.startTime);
      await this.crowdsale.send(cap.plus(1)).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('high-level purchase', function () {
    beforeEach(async function () {
      await increaseTimeTo(this.startTime);
    });

    it('should log purchase', async function () {
      const { logs } = await this.crowdsale.sendTransaction({ value: value, from: investor });

      const event = logs.find(e => e.event === 'TokenPurchase');

      should.exist(event);
      event.args.purchaser.should.equal(investor);
      event.args.beneficiary.should.equal(investor);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should increase totalSupply', async function () {
      await this.crowdsale.send(value);
      const totalSupply = await this.token.totalSupply();
      totalSupply.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should assign tokens to sender', async function () {
      await this.crowdsale.sendTransaction({ value: value, from: investor });
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet);
      await this.crowdsale.sendTransaction({ value, from: investor });
      const post = web3.eth.getBalance(wallet);
      post.minus(pre).should.be.bignumber.equal(value);
    });

    it('should add beneficiary to contributions list', async function () {
      let contributorsLength = await this.contributions.getContributorsLength();
      assert.equal(contributorsLength, 0);

      const pre = await this.contributions.tokenBalances(investor);
      assert.equal(pre, 0);

      await this.crowdsale.sendTransaction({ value, from: investor });

      const post = await this.contributions.tokenBalances(investor);
      assert.equal(post, value * rate);

      contributorsLength = await this.contributions.getContributorsLength();
      assert.equal(contributorsLength, 1);
    });
  });

  describe('low-level purchase', function () {
    beforeEach(async function () {
      await increaseTimeTo(this.startTime);
    });

    it('should log purchase', async function () {
      const { logs } = await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });

      const event = logs.find(e => e.event === 'TokenPurchase');

      should.exist(event);
      event.args.purchaser.should.equal(purchaser);
      event.args.beneficiary.should.equal(investor);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should increase totalSupply', async function () {
      await this.crowdsale.buyTokens(investor, { value, from: purchaser });
      const totalSupply = await this.token.totalSupply();
      totalSupply.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should assign tokens to beneficiary', async function () {
      await this.crowdsale.buyTokens(investor, { value, from: purchaser });
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet);
      await this.crowdsale.buyTokens(investor, { value, from: purchaser });
      const post = web3.eth.getBalance(wallet);
      post.minus(pre).should.be.bignumber.equal(value);
    });

    it('should add beneficiary to contributions list', async function () {
      let contributorsLength = await this.contributions.getContributorsLength();
      assert.equal(contributorsLength, 0);

      const pre = await this.contributions.tokenBalances(investor);
      assert.equal(pre, 0);

      await this.crowdsale.buyTokens(investor, { value, from: purchaser });

      const post = await this.contributions.tokenBalances(investor);
      assert.equal(post, value * rate);

      contributorsLength = await this.contributions.getContributorsLength();
      assert.equal(contributorsLength, 1);
    });
  });

  describe('ending', function () {
    beforeEach(async function () {
      await increaseTimeTo(this.startTime);
    });

    it('should not be ended if under cap', async function () {
      let hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(false);
      await this.crowdsale.send(lessThanCap);
      hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(false);
    });

    it('should not be ended if just under cap', async function () {
      await this.crowdsale.send(cap.minus(1));
      const hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(false);
    });

    it('should be ended if cap reached', async function () {
      await this.crowdsale.send(cap);
      const hasEnded = await this.crowdsale.hasEnded();
      hasEnded.should.equal(true);
    });

    it('should not be ended before end', async function () {
      const ended = await this.crowdsale.hasEnded();
      ended.should.equal(false);
    });

    it('should be ended after end', async function () {
      let ended = await this.crowdsale.hasEnded();
      ended.should.equal(false);
      await increaseTimeTo(this.afterEndTime);
      ended = await this.crowdsale.hasEnded();
      ended.should.equal(true);
    });
  });

  describe('ended', function () {
    it('cannot be closed before end', async function () {
      await this.crowdsale.closeTokenSale(nextCrowdsaleAddress).should.be.rejectedWith(EVMRevert);
      await increaseTimeTo(this.startTime);
      await this.crowdsale.closeTokenSale(nextCrowdsaleAddress).should.be.rejectedWith(EVMRevert);
    });

    it('cannot be closed and transferred to the zero address', async function () {
      await increaseTimeTo(this.afterEndTime);
      await this.crowdsale.closeTokenSale(0x0).should.be.rejectedWith(EVMRevert);
    });

    it('can be closed before end if cap reached', async function () {
      await increaseTimeTo(this.startTime);
      await this.crowdsale.send(cap);
      await this.crowdsale.closeTokenSale(nextCrowdsaleAddress).should.be.fulfilled;
    });

    it('when closed should transfer token ownership to the ico contract', async function () {
      await increaseTimeTo(this.afterEndTime);
      await this.crowdsale.closeTokenSale(nextCrowdsaleAddress);
      const owner = await this.token.owner();
      owner.should.equal(nextCrowdsaleAddress);
    });

    it('when closed should transfer contributions ownership to the ico contract', async function () {
      await increaseTimeTo(this.afterEndTime);
      await this.crowdsale.closeTokenSale(nextCrowdsaleAddress);
      const owner = await this.contributions.owner();
      owner.should.equal(nextCrowdsaleAddress);
    });
  });

  describe('safe functions', function () {
    it('should safe transfer any ERC20 sent for error into the contract', async function () {
      const testToken = await SkillChainToken.new();

      const tokenAmount = 1000;

      testToken.mint(this.crowdsale.address, tokenAmount);
      testToken.finishMinting();

      const owner = await this.crowdsale.owner();

      const contractPre = await testToken.balanceOf(this.crowdsale.address);
      assert.equal(contractPre, tokenAmount);
      const ownerPre = await testToken.balanceOf(owner);
      assert.equal(ownerPre, 0);

      await this.crowdsale.transferAnyERC20Token(testToken.address, tokenAmount);

      const contractPost = await testToken.balanceOf(this.crowdsale.address);
      assert.equal(contractPost, 0);
      const ownerPost = await testToken.balanceOf(owner);
      assert.equal(ownerPost, tokenAmount);
    });
  });

  describe('eidoo interface', function () {
    it('return startTime', async function () {
      const startTime = await this.crowdsale.startTime();
      startTime.should.be.bignumber.equal(this.startTime);
    });

    it('return endTime', async function () {
      const endTime = await this.crowdsale.endTime();
      endTime.should.be.bignumber.equal(this.endTime);
    });

    it('return price', async function () {
      const price = await this.crowdsale.price();
      price.should.be.bignumber.equal(rate);
    });

    it('return totalTokens', async function () {
      const totalTokens = await this.crowdsale.totalTokens();
      totalTokens.should.be.bignumber.equal(rate * cap);
    });

    describe('return started', function () {
      it('false if before start time', async function () {
        const started = await this.crowdsale.started();
        started.should.equal(false);
      });

      it('true if after start time', async function () {
        await increaseTimeTo(this.startTime);
        const started = await this.crowdsale.started();
        started.should.equal(true);
      });
    });

    describe('return ended', function () {
      it('false if before end time', async function () {
        const ended = await this.crowdsale.ended();
        ended.should.equal(false);
      });

      it('false if undercapped', async function () {
        await increaseTimeTo(this.startTime);
        const ended = await this.crowdsale.ended();
        ended.should.equal(false);
      });

      it('true if cap reached', async function () {
        await increaseTimeTo(this.startTime);
        await this.crowdsale.send(cap);
        const ended = await this.crowdsale.ended();
        ended.should.equal(true);
      });

      it('true if after end time', async function () {
        await increaseTimeTo(this.afterEndTime);
        const ended = await this.crowdsale.ended();
        ended.should.equal(true);
      });
    });

    describe('return remainingTokens', function () {
      it('should be equal to totalTokens at start', async function () {
        const remainingTokens = await this.crowdsale.remainingTokens();
        const totalTokens = await this.crowdsale.totalTokens();
        remainingTokens.should.be.bignumber.equal(totalTokens);
      });

      it('should be equal to half totalTokens if cap is half reached', async function () {
        await increaseTimeTo(this.startTime);
        await this.crowdsale.send(cap / 2);

        const remainingTokens = await this.crowdsale.remainingTokens();
        const totalTokens = await this.crowdsale.totalTokens();
        remainingTokens.should.be.bignumber.equal(totalTokens / 2);
      });

      it('should be equal to zero if cap reached', async function () {
        await increaseTimeTo(this.startTime);
        await this.crowdsale.send(cap);

        const remainingTokens = await this.crowdsale.remainingTokens();
        remainingTokens.should.be.bignumber.equal(0);
      });
    });
  });
});
