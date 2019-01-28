import expectThrow from './helpers/expectThrow';
import assertRevert from './helpers/assertRevert';

const EVMRevert = require('./helpers/EVMRevert.js');
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const expect = require('chai').expect;

const SkillChainToken = artifacts.require('SkillChainToken');
const TestContract = artifacts.require('TestContract');

contract('SkillChainToken', function (accounts) {
  describe('test detailed erc20 properties', function () {
    let detailedERC20 = null;

    const _name = 'Skillchain';
    const _symbol = 'SKI';
    const _decimals = 18;

    beforeEach(async function () {
      detailedERC20 = await SkillChainToken.new();
    });

    it('has a name', async function () {
      const name = await detailedERC20.name();
      name.should.be.equal(_name);
    });

    it('has a symbol', async function () {
      const symbol = await detailedERC20.symbol();
      symbol.should.be.equal(_symbol);
    });

    it('has an amount of decimals', async function () {
      const decimals = await detailedERC20.decimals();
      decimals.should.be.bignumber.equal(_decimals);
    });
  });

  describe('test standard token functions', function () {
    let token;

    beforeEach(async function () {
      token = await SkillChainToken.new();
      await token.mint(accounts[0], 100);
      await token.finishMinting();
    });

    it('should return the correct totalSupply after construction', async function () {
      const totalSupply = await token.totalSupply();

      assert.equal(totalSupply, 100);
    });

    it('should return the correct allowance amount after approval', async function () {
      await token.approve(accounts[1], 100);
      const allowance = await token.allowance(accounts[0], accounts[1]);

      assert.equal(allowance, 100);
    });

    it('should return correct balances after transfer', async function () {
      await token.transfer(accounts[1], 100);
      const balance0 = await token.balanceOf(accounts[0]);
      assert.equal(balance0, 0);

      const balance1 = await token.balanceOf(accounts[1]);
      assert.equal(balance1, 100);
    });

    it('should throw an error when trying to transfer more than balance', async function () {
      await assertRevert(token.transfer(accounts[1], 101));
    });

    it('should return correct balances after transfering from another account', async function () {
      await token.approve(accounts[1], 100);
      await token.transferFrom(accounts[0], accounts[2], 100, { from: accounts[1] });

      const balance0 = await token.balanceOf(accounts[0]);
      assert.equal(balance0, 0);

      const balance1 = await token.balanceOf(accounts[2]);
      assert.equal(balance1, 100);

      const balance2 = await token.balanceOf(accounts[1]);
      assert.equal(balance2, 0);
    });

    it('should throw an error when trying to transfer more than allowed', async function () {
      await token.approve(accounts[1], 99);
      await assertRevert(token.transferFrom(accounts[0], accounts[2], 100, { from: accounts[1] }));
    });

    it('should throw an error when trying to transferFrom more than _from has', async function () {
      const balance0 = await token.balanceOf(accounts[0]);
      await token.approve(accounts[1], 99);
      await assertRevert(token.transferFrom(accounts[0], accounts[2], balance0 + 1, { from: accounts[1] }));
    });

    describe('validating allowance updates to spender', function () {
      let preApproved;

      it('should start with zero', async function () {
        preApproved = await token.allowance(accounts[0], accounts[1]);
        assert.equal(preApproved, 0);
      });

      it('should increase by 50 then decrease by 10', async function () {
        await token.increaseApproval(accounts[1], 50);
        const postIncrease = await token.allowance(accounts[0], accounts[1]);
        preApproved.plus(50).should.be.bignumber.equal(postIncrease);
        await token.decreaseApproval(accounts[1], 10);
        const postDecrease = await token.allowance(accounts[0], accounts[1]);
        postIncrease.minus(10).should.be.bignumber.equal(postDecrease);
      });
    });

    it('should increase by 50 then set to 0 when decreasing by more than 50', async function () {
      await token.approve(accounts[1], 50);
      await token.decreaseApproval(accounts[1], 60);
      const postDecrease = await token.allowance(accounts[0], accounts[1]);
      postDecrease.should.be.bignumber.equal(0);
    });

    it('should throw an error when trying to transfer to 0x0', async function () {
      await assertRevert(token.transfer(0x0, 100));
    });

    it('should throw an error when trying to transferFrom to 0x0', async function () {
      await token.approve(accounts[1], 100);
      await assertRevert(token.transferFrom(accounts[0], 0x0, 100, { from: accounts[1] }));
    });
  });

  describe('test mintable token functions', function () {
    let token;

    beforeEach(async function () {
      token = await SkillChainToken.new();
    });

    it('should start with a totalSupply of 0', async function () {
      const totalSupply = await token.totalSupply();

      assert.equal(totalSupply, 0);
    });

    it('should return mintingFinished false after construction', async function () {
      const mintingFinished = await token.mintingFinished();

      assert.equal(mintingFinished, false);
    });

    it('should fail to transfer if minting is not finished', async function () {
      await token.mint(accounts[0], 100);
      await assertRevert(token.transfer(accounts[1], 100), { from: accounts[0] });
    });

    it('should fail to transferFrom if minting is not finished', async function () {
      await token.mint(accounts[0], 100);
      await token.approve(accounts[1], 100, { from: accounts[0] });
      await assertRevert(token.transferFrom(accounts[0], accounts[2], 100, { from: accounts[1] }));
    });

    it('should mint a given amount of tokens to a given address', async function () {
      const result = await token.mint(accounts[0], 100);
      assert.equal(result.logs[0].event, 'Mint');
      assert.equal(result.logs[0].args.to.valueOf(), accounts[0]);
      assert.equal(result.logs[0].args.amount.valueOf(), 100);
      assert.equal(result.logs[1].event, 'Transfer');
      assert.equal(result.logs[1].args.from.valueOf(), 0x0);

      const balance0 = await token.balanceOf(accounts[0]);
      assert(balance0, 100);

      const totalSupply = await token.totalSupply();
      assert(totalSupply, 100);
    });

    it('should fail to mint after call to finishMinting', async function () {
      await token.finishMinting();
      assert.equal(await token.mintingFinished(), true);
      await expectThrow(token.mint(accounts[0], 100));
    });
  });

  describe('test burnable token functions', function () {
    let token;
    const expectedTokenSupply = new BigNumber(999);

    beforeEach(async function () {
      token = await SkillChainToken.new();
      await token.mint(accounts[0], 1000);
      await token.finishMinting();
    });

    it('owner should be able to burn tokens', async function () {
      const { logs } = await token.burn(1, { from: accounts[0] });

      const balance = await token.balanceOf(accounts[0]);
      balance.should.be.bignumber.equal(expectedTokenSupply);

      const totalSupply = await token.totalSupply();
      totalSupply.should.be.bignumber.equal(expectedTokenSupply);

      const event = logs.find(e => e.event === 'Burn');
      expect(event).to.exist; // eslint-disable-line no-unused-expressions
    });

    it('cannot burn more tokens than your balance', async function () {
      await token.burn(2000, { from: accounts[0] }).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('test the approveAndCall function', function () {
    it('should approve a contract and then call the receiveApproval function', async function () {
      const testToken = await SkillChainToken.new();

      const testContract = await TestContract.new();

      const tokenAmount = 1000;
      const testData = 'data passed to the contract';

      await testToken.mint(accounts[0], tokenAmount);
      await testToken.finishMinting();

      let balance0 = await testToken.balanceOf(accounts[0]);
      assert.equal(balance0, tokenAmount);
      let balance1 = await testToken.balanceOf(testContract.address);
      assert.equal(balance1, 0);

      await testToken.approveAndCall(testContract.address, tokenAmount, testData);

      balance0 = await testToken.balanceOf(accounts[0]);
      assert.equal(balance0, 0);
      balance1 = await testToken.balanceOf(testContract.address);
      assert.equal(balance1, tokenAmount);

      const data = await testContract.data();
      assert.equal(web3.toAscii(data), testData);
    });
  });

  describe('safe functions', function () {
    it('should safe transfer any ERC20 sent for error into the contract', async function () {
      const receiverTokenContract = await SkillChainToken.new();
      const testToken = await SkillChainToken.new();

      const tokenAmount = 1000;

      testToken.mint(receiverTokenContract.address, tokenAmount);
      testToken.finishMinting();

      const owner = await receiverTokenContract.owner();

      const contractPre = await testToken.balanceOf(receiverTokenContract.address);
      assert.equal(contractPre, tokenAmount);
      const ownerPre = await testToken.balanceOf(owner);
      assert.equal(ownerPre, 0);

      await receiverTokenContract.transferAnyERC20Token(testToken.address, tokenAmount);

      const contractPost = await testToken.balanceOf(receiverTokenContract.address);
      assert.equal(contractPost, 0);
      const ownerPost = await testToken.balanceOf(owner);
      assert.equal(ownerPost, tokenAmount);
    });
  });
});
