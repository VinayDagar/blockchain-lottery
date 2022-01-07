const fs = require('fs');
const path = require('path');
const solidity = require('solc');

const lotteryPath = path.join(__dirname, 'contracts', 'lottery.sol');

const source = fs.readFileSync(lotteryPath, 'utf8');

module.exports = solidity.compile(source).contracts[':Lottery'];
