# Skillchain
## Your Certified Skills on Blockchain

![Skillchain](https://www.skillchain.io/assets/images/logo-28.png "Skillchain") Skillchain is the definitive **Protocol** where universities, companies and non-academic training companies meet to certify and guarantee **YOUR** skills in a permanent way.

More info at [https://www.skillchain.io](https://www.skillchain.io)

## Smart Contracts Audit

### Author

The audit was performed by **BC1 - Blockchain Pioneers** ([https://www.bc1.tech]( https://www.bc1.tech)) on all the Smart Contracts provided by the **Skillchain** team.

### Overview

Code is hosted on Skillchain official GitHub repo [https://github.com/Skillchain/smart-contracts](https://github.com/Skillchain/smart-contracts) and was forked here [https://github.com/bc1tech/skillchain-audit](https://github.com/bc1tech/skillchain-audit) by BC1 - Blockchain Pioneers team at commit **f725ac8ec66798ef75a095b550aa3126e13504b0**. 

Audited Smart Contracts are in the [contracts](https://github.com/bc1tech/skillchain-audit/tree/master/contracts) folder and they have been deployed by Skillchain on Ethereum blockchain at the following addresses:

* SkillChainToken [0x996dc5dfc819408dd98cd92c9a76f64b0738dc3d](https://etherscan.io/token/0x996dc5dfc819408dd98cd92c9a76f64b0738dc3d)

* SkillChainContributions [0x0a5e725fa3fd699a73202bc089201f49ad4e99a9](https://etherscan.io/address/0x0a5e725fa3fd699a73202bc089201f49ad4e99a9)

* SkillChainPrivateSale [0x0bcaa1c8da60b9f9711191ebf192c879870b322a](https://etherscan.io/address/0x0bcaa1c8da60b9f9711191ebf192c879870b322a)

* SkillChainPresale [0x5f84a30e819fe1d62452899a28a8b3d0776f9ff0](https://etherscan.io/address/0x5f84a30e819fe1d62452899a28a8b3d0776f9ff0)

Smart contracts were compiled using **solc v0.4.19+commit.c4cbbb05.Emscripten.clang**.

Smart contracts use the **OpenZeppelin v1.6.0**.

### Report

Report can be found here  
[https://github.com/bc1tech/skillchain-audit/blob/master/audit/SkillChain-BC1-Audit-Report-V1.0.pdf](https://github.com/bc1tech/skillchain-audit/blob/master/audit/SkillChain-BC1-Audit-Report-V1.0.pdf).

### Result

**PASSED** ✅

No security issues were found.

## Testing Process

[![Build Status](https://travis-ci.org/bc1tech/skillchain-audit.svg?branch=master)](https://travis-ci.org/bc1tech/skillchain-audit)
[![Coverage Status](https://coveralls.io/repos/github/bc1tech/skillchain-audit/badge.svg)](https://coveralls.io/github/bc1tech/skillchain-audit)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/bc1tech/skillchain-audit/blob/master/LICENSE)

### Install dependencies

Use: 

* zeppelin-solidity@1.6.0
* truffle@4.0.6 with solc 0.4.19+commit.c4cbbb05.Emscripten.clang

```bash
npm install
```

### Linter

Use solium@1.1.7

```bash
npm run lint:sol
```

Use eslint

```bash
npm run lint:js
```

### Test

```bash
npm run test
```

Coverage

```bash
npm run coverage
```
