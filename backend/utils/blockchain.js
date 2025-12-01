import crypto from "crypto"

export class Block {
  constructor(index, timestamp, transactions, prev_hash, nonce = 0, hash = "") {
    this.index = index
    this.timestamp = timestamp
    this.transactions = transactions
    this.prev_hash = prev_hash
    this.nonce = nonce
    this.hash = hash
  }

  // Calculate SHA-256 hash
  calculateHash() {
    const data = JSON.stringify({
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions,
      prev_hash: this.prev_hash,
      nonce: this.nonce,
    })

    return crypto.createHash("sha256").update(data).digest("hex")
  }

  // Proof of Work - find nonce where hash starts with '0000'
  mineBlock(difficulty = 4) {
    const difficultyStr = "0".repeat(difficulty)

    while (this.hash.substring(0, difficulty) !== difficultyStr) {
      this.nonce++
      this.hash = this.calculateHash()
    }

    console.log(`Block ${this.index} mined: ${this.hash}`)
  }
}

export class Blockchain {
  constructor(chainName = "DefaultChain", genesisHash = "0") {
    this.chain = []
    this.chainName = chainName
    this.difficulty = 4
    this.genesisBlock = this.createGenesisBlock(genesisHash)
  }

  createGenesisBlock(prev_hash = "0") {
    const genesisBlock = new Block(0, new Date().toISOString(), { type: "genesis", chain: this.chainName }, prev_hash)

    genesisBlock.mineBlock(this.difficulty)
    this.chain.push(genesisBlock)
    return genesisBlock
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }

  addBlock(transactions) {
    const newBlock = new Block(this.chain.length, new Date().toISOString(), transactions, this.getLatestBlock().hash)

    newBlock.mineBlock(this.difficulty)
    this.chain.push(newBlock)
    return newBlock
  }

  // Full chain validation
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]

      // Verify current block hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.log(`Invalid hash at block ${i}`)
        return false
      }

      // Verify previous hash reference
      if (currentBlock.prev_hash !== previousBlock.hash) {
        console.log(`Invalid previous hash at block ${i}`)
        return false
      }

      // Verify PoW
      if (!currentBlock.hash.startsWith("0".repeat(this.difficulty))) {
        console.log(`Invalid PoW at block ${i}`)
        return false
      }
    }

    return true
  }

  // Get chain data
  getChainData() {
    return this.chain.map((block) => ({
      index: block.index,
      timestamp: block.timestamp,
      transactions: block.transactions,
      prev_hash: block.prev_hash,
      nonce: block.nonce,
      hash: block.hash,
    }))
  }
}
