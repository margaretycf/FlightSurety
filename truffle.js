var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
const infuraKey = "a838c79fa4034c9d99806b35795ffd06";

module.exports = {
  networks: {
    //development: {
    //  provider: function() {
    //    return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 50);
    //  },
    //  network_id: '*',
    //  gas: 9999999
    //},
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      gasPrice: 1,
      accounts: 50,
      defaultEtherBalance: 1000,
      websockets: true,
      mnemonic,
    },  
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraKey}`),
        network_id: 4,       // rinkeby's id
        gas: 4500000,        // rinkeby has a lower block limit than mainnet
        gasPrice: 10000000000
    }
  },
  compilers: {
    solc: {
      version: '^0.4.25'
    }
  }
};