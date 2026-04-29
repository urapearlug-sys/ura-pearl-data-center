/**
 * Pool of ~100 blockchain/crypto quiz questions for admin to seed.
 * Each has branchName (maps to preset branches), points 10k ALM per question.
 */

export interface BlockchainQuizItem {
  questionText: string;
  options: string[];
  correctIndex: number;
  branchName: string;
  points?: number;
}

export const BLOCKCHAIN_QUIZ_QUESTIONS: BlockchainQuizItem[] = [
  // --- General (blockchain basics) ---
  { questionText: 'What is a blockchain?', options: ['A centralized database', 'A distributed ledger that records transactions across many computers', 'A type of cloud storage', 'A programming language'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What does "immutable" mean in blockchain context?', options: ['Easily editable', 'Cannot be changed once recorded', 'Stored in memory only', 'Encrypted'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What is a block in a blockchain?', options: ['A physical object', 'A batch of verified transactions grouped together', 'A type of wallet', 'A mining machine'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What is a hash in blockchain?', options: ['A type of currency', 'A fixed-length fingerprint of data', 'A user password', 'A network node'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What is the main benefit of blockchain decentralization?', options: ['Faster single server', 'No single point of failure; trust without one authority', 'Lower storage cost', 'Easier to hack'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What is a node in a blockchain network?', options: ['A cryptocurrency', 'A participant that keeps a copy of the ledger and validates transactions', 'A type of wallet', 'A mining reward'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What is double-spending?', options: ['Paying twice by mistake', 'Spending the same digital asset more than once', 'Using two wallets', 'Mining twice'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What is a consensus mechanism?', options: ['A type of wallet', 'A way for the network to agree on the state of the ledger', 'A trading strategy', 'An exchange'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What does "on-chain" mean?', options: ['Off the internet', 'Recorded on the blockchain', 'In a private database', 'In a wallet app only'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What is a fork in blockchain?', options: ['A hardware device', 'A split in the protocol or chain (e.g. rule change or copy)', 'A type of token', 'A wallet backup'], correctIndex: 1, branchName: 'General', points: 10000 },
  // --- Bitcoin ---
  { questionText: 'Who created Bitcoin?', options: ['Vitalik Buterin', 'Satoshi Nakamoto (pseudonym)', 'Charlie Lee', 'Ethereum Foundation'], correctIndex: 1, branchName: 'Bitcoin', points: 10000 },
  { questionText: 'In what year was the Bitcoin whitepaper published?', options: ['2006', '2008', '2010', '2012'], correctIndex: 1, branchName: 'Bitcoin', points: 10000 },
  { questionText: 'What is the maximum supply of Bitcoin?', options: ['Unlimited', '21 million', '100 million', '18 million'], correctIndex: 1, branchName: 'Bitcoin', points: 10000 },
  { questionText: 'What is the process of creating new Bitcoin called?', options: ['Staking', 'Minting', 'Mining', 'Farming'], correctIndex: 2, branchName: 'Bitcoin', points: 10000 },
  { questionText: 'What consensus does Bitcoin use?', options: ['Proof of Stake', 'Proof of Work', 'Proof of Authority', 'Delegated Proof of Stake'], correctIndex: 1, branchName: 'Bitcoin', points: 10000 },
  { questionText: 'What is a satoshi?', options: ['A type of node', 'The smallest unit of Bitcoin (0.00000001 BTC)', 'A mining pool', 'A wallet provider'], correctIndex: 1, branchName: 'Bitcoin', points: 10000 },
  { questionText: 'What is the Bitcoin halving?', options: ['Splitting the chain', 'Periodic reduction of block rewards for miners', 'Dividing the supply', 'A fork'], correctIndex: 1, branchName: 'Bitcoin', points: 10000 },
  { questionText: 'What does "HODL" mean in crypto slang?', options: ['Hold On for Dear Life (holding through volatility)', 'High Order Digital Ledger', 'Hash Of Data Link', 'None of these'], correctIndex: 0, branchName: 'Bitcoin', points: 10000 },
  { questionText: 'What is the approximate block time for Bitcoin?', options: ['1 minute', '10 minutes', '2 minutes', '15 minutes'], correctIndex: 1, branchName: 'Bitcoin', points: 10000 },
  { questionText: 'What is a UTXO?', options: ['A type of token', 'Unspent Transaction Output – amount of Bitcoin that can be spent', 'A wallet name', 'A mining algorithm'], correctIndex: 1, branchName: 'Bitcoin', points: 10000 },
  // --- Ethereum ---
  { questionText: 'Who founded Ethereum?', options: ['Satoshi Nakamoto', 'Vitalik Buterin', 'CZ (Binance)', 'Andreas Antonopoulos'], correctIndex: 1, branchName: 'Ethereum', points: 10000 },
  { questionText: 'What is Ether (ETH)?', options: ['A sidechain', 'The native cryptocurrency of the Ethereum network', 'A stablecoin', 'A mining pool'], correctIndex: 1, branchName: 'Ethereum', points: 10000 },
  { questionText: 'What are gas fees on Ethereum?', options: ['Fees for physical delivery', 'Fees paid to execute transactions and smart contracts', 'Fees for mining only', 'Fees for staking only'], correctIndex: 1, branchName: 'Ethereum', points: 10000 },
  { questionText: 'What is the Ethereum Virtual Machine (EVM)?', options: ['A physical server', 'A runtime environment that executes smart contracts', 'A type of wallet', 'A mining device'], correctIndex: 1, branchName: 'Ethereum', points: 10000 },
  { questionText: 'Ethereum transitioned from Proof of Work to which consensus?', options: ['Proof of Authority', 'Proof of Stake', 'Delegated Proof of Stake', 'Proof of Burn'], correctIndex: 1, branchName: 'Ethereum', points: 10000 },
  { questionText: 'What is gwei?', options: ['A token', 'A unit of ETH used for gas (1 ETH = 10^9 gwei)', 'A wallet', 'A layer-2 chain'], correctIndex: 1, branchName: 'Ethereum', points: 10000 },
  { questionText: 'What year did the Ethereum mainnet launch?', options: ['2013', '2015', '2017', '2019'], correctIndex: 1, branchName: 'Ethereum', points: 10000 },
  { questionText: 'What is an Ethereum Improvement Proposal (EIP)?', options: ['A type of token', 'A standard for proposing changes to Ethereum', 'A wallet standard', 'A mining protocol'], correctIndex: 1, branchName: 'Ethereum', points: 10000 },
  { questionText: 'What does "merge" refer to in Ethereum?', options: ['Merging two wallets', 'Merging the execution layer with the PoS beacon chain', 'Merging two tokens', 'Merging two exchanges'], correctIndex: 1, branchName: 'Ethereum', points: 10000 },
  { questionText: 'What is ERC-20?', options: ['A hardware wallet', 'A standard for fungible tokens on Ethereum', 'A consensus rule', 'A layer-2 protocol'], correctIndex: 1, branchName: 'Ethereum', points: 10000 },
  // --- Smart Contracts ---
  { questionText: 'What is a smart contract?', options: ['A legal document', 'Self-executing code on a blockchain that runs when conditions are met', 'A wallet feature', 'A mining contract'], correctIndex: 1, branchName: 'Smart Contracts', points: 10000 },
  { questionText: 'Which blockchain popularized smart contracts?', options: ['Bitcoin', 'Ethereum', 'Litecoin', 'Ripple'], correctIndex: 1, branchName: 'Smart Contracts', points: 10000 },
  { questionText: 'What does "immutable" mean for a deployed smart contract?', options: ['It can be edited anytime', 'Code cannot be changed after deployment (unless using upgradeable pattern)', 'It is encrypted', 'It is private'], correctIndex: 1, branchName: 'Smart Contracts', points: 10000 },
  { questionText: 'What is a contract address?', options: ['A user wallet', 'A unique address where a smart contract is deployed', 'An exchange address', 'A mining pool address'], correctIndex: 1, branchName: 'Smart Contracts', points: 10000 },
  { questionText: 'What is a dApp?', options: ['A type of token', 'Decentralized application (runs on blockchain/smart contracts)', 'A centralized app', 'A wallet app'], correctIndex: 1, branchName: 'Smart Contracts', points: 10000 },
  { questionText: 'What is Solidity?', options: ['A wallet', 'A programming language for writing Ethereum smart contracts', 'A consensus algorithm', 'A layer-2 solution'], correctIndex: 1, branchName: 'Smart Contracts', points: 10000 },
  { questionText: 'What is an oracle in blockchain?', options: ['A miner', 'A source that brings off-chain data onto the blockchain', 'A type of wallet', 'A token'], correctIndex: 1, branchName: 'Smart Contracts', points: 10000 },
  { questionText: 'What is a reentrancy attack?', options: ['A network attack', 'An exploit where a contract is called again before the first call finishes', 'A mining attack', 'A wallet hack'], correctIndex: 1, branchName: 'Smart Contracts', points: 10000 },
  { questionText: 'What is ERC-721?', options: ['Fungible token standard', 'Non-fungible token (NFT) standard on Ethereum', 'Stablecoin standard', 'Governance standard'], correctIndex: 1, branchName: 'Smart Contracts', points: 10000 },
  { questionText: 'What does "upgradeable contract" typically use?', options: ['Changing the code directly', 'Proxy pattern: logic can be replaced while keeping same address', 'Forking the chain', 'Deploying a new chain'], correctIndex: 1, branchName: 'Smart Contracts', points: 10000 },
  // --- DeFi ---
  { questionText: 'What does DeFi stand for?', options: ['Decentralized Finance', 'Digital Finance', 'Defined Finance', 'Default Finance'], correctIndex: 0, branchName: 'DeFi', points: 10000 },
  { questionText: 'What is an AMM?', options: ['A type of wallet', 'Automated Market Maker – provides liquidity and price via pools', 'A mining algorithm', 'A consensus mechanism'], correctIndex: 1, branchName: 'DeFi', points: 10000 },
  { questionText: 'What is liquidity pooling?', options: ['Mining together', 'Users depositing assets into a pool to enable trading and earn fees', 'Staking only', 'Lending only'], correctIndex: 1, branchName: 'DeFi', points: 10000 },
  { questionText: 'What is yield farming?', options: ['Mining cryptocurrency', 'Earning returns by providing liquidity or staking in DeFi protocols', 'Trading only', 'Holding only'], correctIndex: 1, branchName: 'DeFi', points: 10000 },
  { questionText: 'What is impermanent loss?', options: ['Permanent wallet loss', 'Temporary loss vs. holding when providing liquidity in an AMM', 'Exchange hack', 'Gas fee loss'], correctIndex: 1, branchName: 'DeFi', points: 10000 },
  { questionText: 'What is a DEX?', options: ['Decentralized Exchange', 'Digital Exchange', 'Default Exchange', 'Direct Exchange'], correctIndex: 0, branchName: 'DeFi', points: 10000 },
  { questionText: 'What is collateral in DeFi lending?', options: ['A token reward', 'Assets locked to borrow other assets', 'A type of fee', 'A governance token'], correctIndex: 1, branchName: 'DeFi', points: 10000 },
  { questionText: 'What is TVL?', options: ['Total Value Locked – total value of assets in a protocol', 'Total Volume Ledger', 'Token Value Limit', 'Transaction Value Log'], correctIndex: 0, branchName: 'DeFi', points: 10000 },
  { questionText: 'What is a flash loan?', options: ['A long-term loan', 'An uncollateralized loan that must be borrowed and repaid in one transaction', 'A staking reward', 'A mining reward'], correctIndex: 1, branchName: 'DeFi', points: 10000 },
  { questionText: 'What is a stablecoin?', options: ['A volatile token', 'A cryptocurrency pegged to a stable asset (e.g. USD)', 'A mining token', 'A governance-only token'], correctIndex: 1, branchName: 'DeFi', points: 10000 },
  // --- NFTs ---
  { questionText: 'What does NFT stand for?', options: ['Non-Fungible Token', 'Network Fund Token', 'New Finance Token', 'Native Fungible Token'], correctIndex: 0, branchName: 'NFTs', points: 10000 },
  { questionText: 'What does "non-fungible" mean?', options: ['Interchangeable with others', 'Unique; not interchangeable like cash', 'Divisible', 'Mining-related'], correctIndex: 1, branchName: 'NFTs', points: 10000 },
  { questionText: 'What is minting an NFT?', options: ['Burning a token', 'Creating and publishing an NFT on a blockchain', 'Selling an NFT', 'Staking an NFT'], correctIndex: 1, branchName: 'NFTs', points: 10000 },
  { questionText: 'What is metadata in an NFT?', options: ['The blockchain only', 'Data (name, image, traits) often stored off-chain and linked from the token', 'Mining data', 'Wallet data'], correctIndex: 1, branchName: 'NFTs', points: 10000 },
  { questionText: 'What is a royalty in NFTs?', options: ['A one-time fee', 'Percentage of future sales paid to the creator', 'A gas fee', 'A minting fee'], correctIndex: 1, branchName: 'NFTs', points: 10000 },
  { questionText: 'Which standard is commonly used for NFTs on Ethereum?', options: ['ERC-20', 'ERC-721', 'ERC-1155', 'Both ERC-721 and ERC-1155'], correctIndex: 3, branchName: 'NFTs', points: 10000 },
  { questionText: 'What is IPFS in relation to NFTs?', options: ['A blockchain', 'Decentralized storage often used for NFT media and metadata', 'A wallet', 'An exchange'], correctIndex: 1, branchName: 'NFTs', points: 10000 },
  { questionText: 'What is a collection in NFT context?', options: ['A wallet', 'A set of NFTs under one contract or project', 'A type of token', 'A mining pool'], correctIndex: 1, branchName: 'NFTs', points: 10000 },
  { questionText: 'What is "floor price" for an NFT collection?', options: ['Highest price', 'Lowest listed price for an item in the collection', 'Average price', 'Mint price'], correctIndex: 1, branchName: 'NFTs', points: 10000 },
  { questionText: 'What is a burn in NFTs?', options: ['Sending to a dead address to remove from supply', 'Selling an NFT', 'Minting an NFT', 'Staking an NFT'], correctIndex: 0, branchName: 'NFTs', points: 10000 },
  // --- Security ---
  { questionText: 'What is a private key?', options: ['A public address', 'A secret that controls access to your crypto assets', 'A password for an exchange', 'A node key'], correctIndex: 1, branchName: 'Security', points: 10000 },
  { questionText: 'What is phishing in crypto?', options: ['Mining', 'Fake sites/emails to steal keys or passwords', 'Trading', 'Staking'], correctIndex: 1, branchName: 'Security', points: 10000 },
  { questionText: 'What is a hardware wallet?', options: ['A software app', 'A physical device that stores private keys offline', 'A type of exchange', 'A mining device'], correctIndex: 1, branchName: 'Security', points: 10000 },
  { questionText: 'What does "not your keys, not your coins" mean?', options: ['Keys are not important', 'If you do not control the private keys, you do not truly own the assets', 'Keys are on the exchange', 'Coins are always safe'], correctIndex: 1, branchName: 'Security', points: 10000 },
  { questionText: 'What is a seed phrase?', options: ['A mining term', 'A series of words that can recover a wallet and its keys', 'A token name', 'A contract address'], correctIndex: 1, branchName: 'Security', points: 10000 },
  { questionText: 'What is a rug pull?', options: ['A type of mining', 'Developers or insiders draining liquidity or stealing funds', 'A consensus attack', 'A wallet upgrade'], correctIndex: 1, branchName: 'Security', points: 10000 },
  { questionText: 'What is two-factor authentication (2FA)?', options: ['One password', 'Extra step (e.g. app or SMS) to verify login', 'A type of wallet', 'A blockchain'], correctIndex: 1, branchName: 'Security', points: 10000 },
  { questionText: 'Why should you never share your seed phrase?', options: ['It is not important', 'Anyone with it can control the wallet and steal funds', 'It is required by law', 'Exchanges need it'], correctIndex: 1, branchName: 'Security', points: 10000 },
  { questionText: 'What is a smart contract audit?', options: ['A legal audit', 'Review of contract code to find security issues', 'A tax audit', 'A wallet check'], correctIndex: 1, branchName: 'Security', points: 10000 },
  { questionText: 'What is a dust attack?', options: ['Mining attack', 'Sending tiny amounts to link addresses for tracking or phishing', 'Consensus attack', 'Exchange hack'], correctIndex: 1, branchName: 'Security', points: 10000 },
  // --- Technical ---
  { questionText: 'What is a Merkle tree?', options: ['A type of wallet', 'A structure that efficiently verifies data in a block', 'A mining algorithm', 'A token standard'], correctIndex: 1, branchName: 'Technical', points: 10000 },
  { questionText: 'What is a Layer 2 (L2)?', options: ['A main blockchain', 'A network built on top of a base chain to scale (e.g. rollups)', 'A type of wallet', 'A mining layer'], correctIndex: 1, branchName: 'Technical', points: 10000 },
  { questionText: 'What is a rollup?', options: ['A type of miner', 'An L2 that batches transactions and posts data to the main chain', 'A wallet', 'A token'], correctIndex: 1, branchName: 'Technical', points: 10000 },
  { questionText: 'What is finality in blockchain?', options: ['First block', 'When a block/transaction is considered irreversible', 'A type of fee', 'A consensus name'], correctIndex: 1, branchName: 'Technical', points: 10000 },
  { questionText: 'What is a mempool?', options: ['A wallet', 'Pool of pending transactions waiting to be included in a block', 'A mining pool', 'A token pool'], correctIndex: 1, branchName: 'Technical', points: 10000 },
  { questionText: 'What is sharding?', options: ['A single chain', 'Splitting the chain into smaller pieces to scale', 'A type of wallet', 'A consensus mechanism'], correctIndex: 1, branchName: 'Technical', points: 10000 },
  { questionText: 'What is a bridge in crypto?', options: ['A physical device', 'A protocol that moves assets between chains', 'A type of wallet', 'A mining tool'], correctIndex: 1, branchName: 'Technical', points: 10000 },
  { questionText: 'What is Proof of Stake (PoS)?', options: ['Mining with hardware', 'Validators stake tokens to secure the network and earn rewards', 'A type of contract', 'A wallet type'], correctIndex: 1, branchName: 'Technical', points: 10000 },
  { questionText: 'What is slashing in PoS?', options: ['A reward', 'Penalty (e.g. losing staked funds) for misbehavior', 'A fee', 'A token burn'], correctIndex: 1, branchName: 'Technical', points: 10000 },
  { questionText: 'What is a testnet?', options: ['Main blockchain', 'A separate network for testing without real value', 'A type of wallet', 'An exchange'], correctIndex: 1, branchName: 'Technical', points: 10000 },
  // --- Extra to reach 100 ---
  { questionText: 'What is a whitepaper in crypto?', options: ['A legal document', 'A document describing a project’s technology and goals', 'A wallet manual', 'A mining guide'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What is market cap in crypto?', options: ['Trading volume', 'Price × circulating supply', 'Number of coins', 'Total fees'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What is a bull market?', options: ['Falling prices', 'Prolonged period of rising prices', 'Sideways market', 'No trading'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What is a bear market?', options: ['Rising prices', 'Prolonged period of falling prices', 'Stable prices', 'New listings only'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What is FUD?', options: ['A token', 'Fear, Uncertainty, Doubt – negative sentiment', 'A protocol', 'A wallet'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What is a cold wallet?', options: ['An exchange account', 'A wallet kept offline for security', 'A hot wallet', 'A mining wallet'], correctIndex: 1, branchName: 'Security', points: 10000 },
  { questionText: 'What is a hot wallet?', options: ['Offline only', 'A wallet connected to the internet (e.g. exchange or browser)', 'A hardware wallet', 'A paper wallet'], correctIndex: 1, branchName: 'Security', points: 10000 },
  { questionText: 'What is gas limit?', options: ['Unlimited gas', 'Maximum units of gas a user allows for a transaction', 'Mining limit', 'Staking limit'], correctIndex: 1, branchName: 'Ethereum', points: 10000 },
  { questionText: 'What is an airdrop?', options: ['A fee', 'Free distribution of tokens to certain addresses', 'A mining reward', 'A loan'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What is governance in crypto?', options: ['Mining only', 'Token holders voting on protocol changes or parameters', 'Exchange rules', 'Legal compliance only'], correctIndex: 1, branchName: 'DeFi', points: 10000 },
  { questionText: 'What is a block explorer?', options: ['A wallet', 'A tool to view transactions and blocks on a blockchain', 'A mining tool', 'An exchange'], correctIndex: 1, branchName: 'Technical', points: 10000 },
  { questionText: 'What is a hard fork?', options: ['A minor update', 'A backward-incompatible protocol change; can create a new chain', 'A soft update', 'A wallet split'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What is a soft fork?', options: ['New chain created', 'Backward-compatible protocol change', 'A hard fork', 'A wallet upgrade'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What is a multisig wallet?', options: ['Single key', 'Wallet requiring multiple signatures to approve a transaction', 'A hot wallet', 'A mining wallet'], correctIndex: 1, branchName: 'Security', points: 10000 },
  { questionText: 'What is MEV?', options: ['Mining reward', 'Maximal Extractable Value – profit from ordering/including transactions', 'Token value', 'Exchange volume'], correctIndex: 1, branchName: 'Technical', points: 10000 },
  { questionText: 'What is a DAO?', options: ['A token', 'Decentralized Autonomous Organization – member-governed entity', 'A wallet', 'A mining pool'], correctIndex: 1, branchName: 'DeFi', points: 10000 },
  { questionText: 'What is the genesis block?', options: ['Latest block', 'The first block in a blockchain', 'A fork', 'A sidechain'], correctIndex: 1, branchName: 'General', points: 10000 },
  { questionText: 'What is a validator in PoS?', options: ['A miner', 'A node that proposes/attests blocks and stakes tokens', 'A wallet', 'A contract'], correctIndex: 1, branchName: 'Technical', points: 10000 },
  { questionText: 'What is a burn address?', options: ['A wallet to receive funds', 'An address where sent tokens are unrecoverable (reduced supply)', 'A mining address', 'An exchange address'], correctIndex: 1, branchName: 'General', points: 10000 },
];
