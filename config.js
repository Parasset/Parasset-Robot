let endPoints = "wss://mainnet.infura.io/ws/v3/fc64f828e2054f30b145122e34dff479";
let mortgagePoolAddress = "";
let nestQueryAddress = '';//NEST 价格查询合约
//代币地址
let ethToken = '0x0000000000000000000000000000000000000000';
let nestToken = '';//NEST Token
let usdtToken = '';//USDT Token
let pusdtToken = '';//PUSDT Token
let pethToken = '';//PETH Token
let privateKey = process.env.DEBUG;


if (process.env.DEBUG) {
  // endPoints = "wss://ropsten.infura.io/ws/v3/fc64f828e2054f30b145122e34dff479";
  endPoints = "https://ropsten.infura.io/v3/fc64f828e2054f30b145122e34dff479";
  mortgagePoolAddress = "0x398F09004225AA8f6a0775829e9b993697E806E2";
  nestQueryAddress = '0x364b22983ed7EABb4de94924D7e17411FDE674Ae';//NEST 价格合约
  ethToken = '0x0000000000000000000000000000000000000000';
  nestToken = '0xae6E04ED92FC12238852cA212f09b96Dc23407C1';//NEST Token
  usdtToken = '0xEDfe846E914d0aaaA42aC031D2D5Fc5467E68a81';//USDT Token
  pusdtToken = '0x1a8A52074932Af7333626a3e757524E3667D78C5';//PUSDT Token
  pethToken = '0x282f780533B748a256872E5855d3d84C3bf64Ac0';//PETH Token
}

module.exports = {
  endPoints,
  privateKey,
  mortgagePoolAddress,
  ethToken,
  nestToken,
  usdtToken,
  pusdtToken,
  pethToken,
  nestQueryAddress,
}
