var express = require('express');
var router = express.Router();
const Web3 = require('web3');
const abiMortgagePool = require('../libs/abi/abiMortgagePool');
const config = require('../config');
const tradeInfo = require('../conf/tradeInfo');
const mysqlConnect = require('../libs/db/mysql');


/* GET users listing. */
router.get('/trade', async (req, res, next) => {
  var web3 = new Web3(config.endPoints);
  const mortgagePoolContract = new web3.eth.Contract(abiMortgagePool, config.mortgagePoolAddress);//保险池合约
  const arr = [];
  mysqlConnect.connect();
  for (let k in tradeInfo.tradeArr) {
    const item = tradeInfo.tradeArr[k];
    // 链上的数据
    const chainLength = await mortgagePoolContract.methods.getLedgerArrayNum(config[`${item[1]}Token`], config[`${item[0]}Token`]).call();
    const selectKey = `${item[1]}/${item[0]}`;
    mysqlConnect.query(`
      SELECT * from trade where tradeArr='${selectKey}';
    `, async (err, data) => {
      if (err) {
        console.log("数据库访问出错", err);
      } else {
        // 没有键对值，写入数据
        if (data[0].length === 0) {
          await mysqlConnect.query(`
            INSERT INTO trade ( tradeArr, length )
                       VALUES
                       ( '${selectKey}', ${chainLength});
          `);
        } else {
          // 有键对值，比对，如果有更新就更新数据
          if (data[0].length > chainLength) {
            await mysqlConnect.query(`
              update trade set length=${chainLength} where id=${data[0].id};
            `);
          }
        }
      }
    });
  }

  // test usdt balance ok
  // const contract = await new web3.eth.Contract(abiERC20, config.usdtToken);//usdt 代币
  // let rs = await contract.methods.balanceOf(account.address).call();


  res.send('ok');
});

router.get('/update', async (req, res, next) => {
  var web3 = new Web3(config.endPoints);
  const mortgagePoolContract = new web3.eth.Contract(abiMortgagePool, config.mortgagePoolAddress);//保险池合约
  mysqlConnect.connect();
  for (let k in tradeInfo.tradeArr) {
    const item = tradeInfo.tradeArr[k];
    const selectKey = `${item[1]}/${item[0]}`;
    // 链上的数据
    const chainLength = await mortgagePoolContract.methods.getLedgerArrayNum(config[`${item[1]}Token`], config[`${item[0]}Token`]).call();
    // 数据库的数据
    mysqlConnect.query(`
      SELECT COUNT(1) as len FROM user where tradeType='${selectKey}';
    `, async (err, data) => {
      const len = data[0].len;
      if (err) {
        console.log("数据库访问出错", err);
      } else {
        const num = chainLength - len;
        if (num > 0) {
          for (let k = len; k < chainLength; k++) {
            const chainAddress = await mortgagePoolContract.methods.getLedgerAddress(config[`${item[1]}Token`], config[`${item[0]}Token`], k).call();
            mysqlConnect.query(`
                INSERT INTO user ( tradeType, address )
                       VALUES
                       ( '${selectKey}', '${chainAddress}');
              `);
          }
        }
      }
    });
  }

  // test usdt balance ok
  // const contract = await new web3.eth.Contract(abiERC20, config.usdtToken);//usdt 代币
  // let rs = await contract.methods.balanceOf(account.address).call();


  res.send('update ok');
});

module.exports = router;
