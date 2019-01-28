const EVMRevert = require('./helpers/EVMRevert.js');
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const SkillChainContributions = artifacts.require('SkillChainContributions');

contract('SkillChainContributions', function ([_, owner, thirdParty, anotherThirdParty]) {
  beforeEach(async function () {
    this.contributions = await SkillChainContributions.new({ from: owner });
  });

  it('owner should success to add token amount to the address balance', async function () {
    let balance = await this.contributions.tokenBalances(thirdParty);
    assert.equal(balance, 0);

    await this.contributions.addBalance(thirdParty, 100, { from: owner });

    balance = await this.contributions.tokenBalances(thirdParty);
    assert.equal(balance, 100);

    await this.contributions.addBalance(thirdParty, 300, { from: owner });

    balance = await this.contributions.tokenBalances(thirdParty);
    assert.equal(balance, 400);
  });

  it('third party should fail to add token amount to the address balance', async function () {
    let balance = await this.contributions.tokenBalances(thirdParty);
    assert.equal(balance, 0);

    await this.contributions.addBalance(thirdParty, 100, { from: thirdParty }).should.be.rejectedWith(EVMRevert);

    balance = await this.contributions.tokenBalances(thirdParty);
    assert.equal(balance, 0);
  });

  it('should increase array length when different address are passed', async function () {
    let contributorsLength = await this.contributions.getContributorsLength();
    assert.equal(contributorsLength, 0);

    await this.contributions.addBalance(thirdParty, 100, { from: owner });

    contributorsLength = await this.contributions.getContributorsLength();
    assert.equal(contributorsLength, 1);

    await this.contributions.addBalance(anotherThirdParty, 100, { from: owner });

    contributorsLength = await this.contributions.getContributorsLength();
    assert.equal(contributorsLength, 2);
  });

  it('should not increase array length when same address is passed', async function () {
    let contributorsLength = await this.contributions.getContributorsLength();
    assert.equal(contributorsLength, 0);

    await this.contributions.addBalance(thirdParty, 100, { from: owner });

    contributorsLength = await this.contributions.getContributorsLength();
    assert.equal(contributorsLength, 1);

    await this.contributions.addBalance(thirdParty, 100, { from: owner });

    contributorsLength = await this.contributions.getContributorsLength();
    assert.equal(contributorsLength, 1);
  });

  it('should cycle addresses and have the right value set', async function () {
    await this.contributions.addBalance(owner, 10, { from: owner });
    await this.contributions.addBalance(thirdParty, 20, { from: owner });
    await this.contributions.addBalance(anotherThirdParty, 30, { from: owner });
    await this.contributions.addBalance(anotherThirdParty, 30, { from: owner });

    const balances = [];
    balances[owner] = await this.contributions.tokenBalances(owner);
    balances[thirdParty] = await this.contributions.tokenBalances(thirdParty);
    balances[anotherThirdParty] = await this.contributions.tokenBalances(anotherThirdParty);

    const contributorsLength = (await this.contributions.getContributorsLength()).valueOf();

    for (let i = 0; i < contributorsLength.valueOf(); i++) {
      const address = await this.contributions.addresses(i);
      const balance = await this.contributions.tokenBalances(address);

      assert.equal(balance.valueOf(), balances[address].valueOf());
    }
  });
});
