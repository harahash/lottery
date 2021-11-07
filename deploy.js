const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const { abi, evm } = require("./compile");

const provider = new HDWalletProvider(
	"learn original approve glass pelican plug network load noble fun okay nice",
	"https://rinkeby.infura.io/v3/2f532d2c5245479594491c1bba445406"
);

const web3 = new Web3(provider);

const deploy = async () => {
	const accounts = await web3.eth.getAccounts();

	console.log("Attempting to deploy from account", accounts[0]);

	const result = await new web3.eth.Contract(abi)
		.deploy({ data: evm.bytecode.object })
		.send({ gas: "1000000", from: accounts[0] });

	console.log(abi);
	console.log(JSON.stringify(abi)) // BETTER SOLUTION
	console.log("Contract deployed to", result.options.address);
	provider.engine.stop();
};

deploy();
