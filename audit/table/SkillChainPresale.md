## Sūrya's Description Report

### Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| dist/SkillChainPresale.sol | 7f75ee527e0926626b5d8a53135b6b4f8297c408 |


### Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **SafeMath** | Library |  |||
| └ | mul | Internal 🔒 |   | |
| └ | div | Internal 🔒 |   | |
| └ | sub | Internal 🔒 |   | |
| └ | add | Internal 🔒 |   | |
||||||
| **Ownable** | Implementation |  |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
| └ | transferOwnership | Public ❗️ | 🛑  | onlyOwner |
||||||
| **SkillChainContributions** | Implementation | Ownable |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
| └ | addBalance | Public ❗️ | 🛑  | onlyOwner |
| └ | getContributorsLength | Public ❗️ |   | |
||||||
| **ApproveAndCallFallBack** | Implementation |  |||
| └ | receiveApproval | Public ❗️ | 🛑  | |
||||||
| **ERC20Basic** | Implementation |  |||
| └ | totalSupply | Public ❗️ |   | |
| └ | balanceOf | Public ❗️ |   | |
| └ | transfer | Public ❗️ | 🛑  | |
||||||
| **BasicToken** | Implementation | ERC20Basic |||
| └ | totalSupply | Public ❗️ |   | |
| └ | transfer | Public ❗️ | 🛑  | |
| └ | balanceOf | Public ❗️ |   | |
||||||
| **BurnableToken** | Implementation | BasicToken |||
| └ | burn | Public ❗️ | 🛑  | |
||||||
| **ERC20** | Implementation | ERC20Basic |||
| └ | allowance | Public ❗️ |   | |
| └ | transferFrom | Public ❗️ | 🛑  | |
| └ | approve | Public ❗️ | 🛑  | |
||||||
| **DetailedERC20** | Implementation | ERC20 |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
||||||
| **StandardToken** | Implementation | ERC20, BasicToken |||
| └ | transferFrom | Public ❗️ | 🛑  | |
| └ | approve | Public ❗️ | 🛑  | |
| └ | allowance | Public ❗️ |   | |
| └ | increaseApproval | Public ❗️ | 🛑  | |
| └ | decreaseApproval | Public ❗️ | 🛑  | |
||||||
| **MintableToken** | Implementation | StandardToken, Ownable |||
| └ | mint | Public ❗️ | 🛑  | onlyOwner canMint |
| └ | finishMinting | Public ❗️ | 🛑  | onlyOwner canMint |
||||||
| **SkillChainToken** | Implementation | DetailedERC20, MintableToken, BurnableToken |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | DetailedERC20 |
| └ | transfer | Public ❗️ | 🛑  | canTransfer |
| └ | transferFrom | Public ❗️ | 🛑  | canTransfer |
| └ | approveAndCall | Public ❗️ | 🛑  | |
| └ | transferAnyERC20Token | Public ❗️ | 🛑  | onlyOwner |
||||||
| **Crowdsale** | Implementation |  |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
| └ | \<Fallback\> | External ❗️ |  💵 | |
| └ | buyTokens | Public ❗️ |  💵 | |
| └ | hasEnded | Public ❗️ |   | |
| └ | createTokenContract | Internal 🔒 | 🛑  | |
| └ | getTokenAmount | Internal 🔒 |   | |
| └ | forwardFunds | Internal 🔒 | 🛑  | |
| └ | validPurchase | Internal 🔒 |   | |
||||||
| **CappedCrowdsale** | Implementation | Crowdsale |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
| └ | hasEnded | Public ❗️ |   | |
| └ | validPurchase | Internal 🔒 |   | |
||||||
| **SkillChainPresale** | Implementation | CappedCrowdsale, Ownable |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | CappedCrowdsale Crowdsale |
| └ | buyTokens | Public ❗️ |  💵 | |
| └ | closeTokenSale | Public ❗️ | 🛑  | onlyOwner |
| └ | transferAnyERC20Token | Public ❗️ | 🛑  | onlyOwner |
| └ | started | Public ❗️ |   | |
| └ | ended | Public ❗️ |   | |
| └ | totalTokens | Public ❗️ |   | |
| └ | remainingTokens | Public ❗️ |   | |
| └ | price | Public ❗️ |   | |
| └ | createTokenContract | Internal 🔒 | 🛑  | |
| └ | validPurchase | Internal 🔒 |   | |


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
