const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const { interface, bytecode } = require('../compile');
const provider = ganache.provider();
const web3 = new Web3(provider);

let accounts;
let lottery;

beforeEach(async () => {
  // Get list of all accounts
  accounts = await web3.eth.getAccounts();

  // Deploying the contract
  lottery = await new web3.eth.Contract(JSON.parse(interface)) // tells web3 to about the methods contracts has, interface is ABI of the contract
    .deploy({ data: bytecode }) // specifies that we want to deploy a copy of this contract
    .send({ from: accounts[0], gas: '1000000' }); // sends a transaction that creates this contract

  lottery.setProvider(provider);
});

describe('Lottery Contract', () => {
  it('deploys Lottery contract', () => {
    assert.ok(lottery.options.address);
  });

  it('allows an account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.playerList().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it('allows multiple account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.playerList().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  it('requires minimum amount of ether to enter', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0
      });

      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('only manager can pick Winner', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      });

      assert(false);
    } catch (err) {
      assert(err)
    }
  });

  it('should reset the player after winner is picked', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });

    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });

    const players = await lottery.methods.playerList().call({
      from: accounts[0]
    });

    assert.equal(0, players.length);
  });

  it('send money to the winner', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    });
  })

});
