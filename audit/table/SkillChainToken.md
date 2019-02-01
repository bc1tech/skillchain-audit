## Sūrya's Description Report

### Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| dist/SkillChainToken.sol | eb3dc75e6cf8bd3c401a16459829e670476280f9 |


### Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **ApproveAndCallFallBack** | Implementation |  |||
| └ | receiveApproval | Public ❗️ | 🛑  | |
||||||
| **SafeMath** | Library |  |||
| └ | mul | Internal 🔒 |   | |
| └ | div | Internal 🔒 |   | |
| └ | sub | Internal 🔒 |   | |
| └ | add | Internal 🔒 |   | |
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
| **Ownable** | Implementation |  |||
| └ | \<Constructor\> | Public ❗️ | 🛑  | |
| └ | transferOwnership | Public ❗️ | 🛑  | onlyOwner |
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


### Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
