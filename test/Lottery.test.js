const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const { abi, evm } = require("../compile");

let lottery;
let accounts;

beforeEach(async () => {
	accounts = await web3.eth.getAccounts();

	lottery = await new web3.eth.Contract(abi)
		.deploy({ data: evm.bytecode.object })
		.send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery Contract", () => {
	it("deploys a contact", () => {
		assert.ok(lottery.options.address);
	});

	it("allows one account to enter", async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei("0.02", "ether"),
		});

		const players = await lottery.methods.getPlayers().call({
			from: accounts[0],
		});

		assert.equal(accounts[0], players[0]);
		assert.equal(1, players.length);
	});

	it("allows multiple account to enter", async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei("0.02", "ether"),
		});
		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei("0.02", "ether"),
		});
		await lottery.methods.enter().send({
			from: accounts[2],
			value: web3.utils.toWei("0.02", "ether"),
		});

		const players = await lottery.methods.getPlayers().call({
			from: accounts[0],
		});

		assert.equal(accounts[0], players[0]);
		assert.equal(accounts[1], players[1]);
		assert.equal(accounts[2], players[2]);
		assert.equal(3, players.length);
	});

	it("requires a minimum amount of ether to enter", async () => {
		try {
			await lottery.methods.enter().send({
				from: accounts[0],
				value: 200,
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});

	it("only manager can call pickWinner", async () => {
		try {
			await lottery.methods.pickWinner().send({
				from: accounts[1],
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});

	it("sends money to the winner and resets players", async () => {
		await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('2', 'ether'),
        });

        const initialBalance = await web3.eth.getBalance(accounts[1]);
        await lottery.methods.pickWinner().send({ from: accounts[0] });
        const finalBalance = await web3.eth.getBalance(accounts[1]);

		// checking if the player/address received ether
        const winnings = finalBalance - initialBalance;
        assert.equal(web3.utils.toWei('2', 'ether'), winnings);

		// checking if the array of players/addresses is empty
        const players = await lottery.methods.getPlayers().call({ from: accounts[0] });
        assert.equal(players.length, 0);

		// checking if the ballance is equal to 0
        const contractBalance = await web3.eth.getBalance(lottery.options.address);
        assert.equal(contractBalance, 0);
	});
});
