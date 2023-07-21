require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths:{
    sources: './contracts',
    artifacts: './src/artifacts'
  },
  defaultNetwork: 'hardhat',
  networks:{
    hardhat:{
      chainId: 31337
    }
  }
};

// Task to list accounts and their balance from HardHat Node
task(
  'accounts',
  'Prints the list of accounts and their balances',
  async(taskArgs, hre) =>{
    const accounts = await hre.ethers.getSigners();
    for(const account of accounts) {
      const provider = hre.ethers.provider;
      const balance = await provider.getBalance(account.address);
      console.log(account.address, ": ", balance);
    }
  }
)

//deploy testnets 
3