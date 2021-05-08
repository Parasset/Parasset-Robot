var express = require('express');
var router = express.Router();
const Web3 = require('web3');
const abiMortgagePool = require('../libs/abi/abiMortgagePool');
const abiNestQuery = require('../libs/abi/abiNestQuery');
const config = require('../config');
const tradeInfo = require('../conf/tradeInfo');
const mysqlConnect = require('../libs/db/mysql');
const {BigNumberStr, BigNumberMul} = require('../libs/computer/bignumber');

var web3 = new Web3(config.endPoints);
const mortgagePoolContract = new web3.eth.Contract(abiMortgagePool, config.mortgagePoolAddress);//保险池合约
const nestQueryContract = new web3.eth.Contract(abiNestQuery, config.nestQueryAddress);//NEST 价格合约
const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
router.get('/liquidation', async (req, res, next) => {
  mysqlConnect.connect();
  for (let k in tradeInfo.tradeArr) {
    const item = tradeInfo.tradeArr[k];
    const selectKey = `${item[1]}/${item[0]}`;
    const selectKeyWeb = `${item[0]}/${item[1]}`;
    mysqlConnect.query(`
      SELECT * FROM user where tradeType='${selectKey}' GROUP BY address order by createTime desc;
    `, async (err, rows, fields) => {
      for (let k in rows) {
        const row = rows[k];
        const ledgerInfo = await mortgagePoolContract.methods.getLedger(config[`${item[1]}Token`], config[`${item[0]}Token`], row.address).call();
        // todo
        // liquidation(selectKeyWeb, ledgerInfo, row.address, config[`${item[1]}Token`], config[`${item[0]}Token`])
        await logLiquidationLog(config[`${item[0]}Token`], config[`${item[1]}Token`], row.address, ledgerInfo.mortgageAssets)
      }
    });
  }

  res.send('update ok');
});


const liquidation = async (i, data, address, pTokenAddress, tokenAddress) => {
  // this.allowance = data;
  // console.log('data2',data1)
  // return;
  // for(let i in data1) {
  const priceObj = await getLatestPrice(address);
  if (i == 'eth/pusdt') {
    data.mTitle = 'ETH';
    data.pTitle = 'PUSDT';
    data.key1 = 'eth';
    data.key2 = 'pusdt';
    data.mortgageAssets = BigNumberStr(data.mortgageAssets, 18);
    data.parassetAssets = BigNumberStr(data.parassetAssets, 18);
    data.rate = BigNumberStr(data.rate, 0);
    data.mUsdtPrice = BigNumberStr(priceObj.eth_price * data.mortgageAssets, 0, 6);
    data.pUsdtPrice = BigNumberStr(priceObj.pusdt_price * data.parassetAssets, 0, 6);
    data.maxRate = 70;
    await getMaxRate(address, data.key1).then(async (dataSon) => {
      // console.log('最高抵押率', dataSon);
      data.maxRate = dataSon;
    });
    data.getK = 1.25;
    await getK(address,data.key1).then(async (dataSon) => {
      // console.log("清算线", dataSon);
      data.getK = BigNumberStr(dataSon,3);
    });
    data.clearingRate = BigNumberStr(data.maxRate * data.getK,0,0);
    data.getFee = 0;
    data.getKLine = 0;
    data.getMortgageRate = 0;
    await getInfoRealTime(address, data.key1, data.key2, priceObj, data.maxRate).then(async (dataSon) => {
      data.getFee = BigNumberStr(dataSon, 18, 8);
    });
    data.clearingPrice = BigNumberStr((data.parassetAssets * 1 + data.getFee * 1) / (data.mortgageAssets * data.clearingRate / 100), 0, 6);
    data.clearingPriceUnit = 'USDT';
    data.getMortgageRate = BigNumberStr(((data.parassetAssets * 1 + data.getFee * 1) * priceObj.pusdt_price / data.mUsdtPrice) * 100, 0, 6);
    if (data.mortgageAssets * 1 <= 0 || data.mUsdtPrice * 1 <= 0) {
      data.clearingPrice = 0;
      data.getMortgageRate = 0;
    }
    //状态 0待清算(抵押率大于等于清算抵押率)颜色red 1预警(抵押率大于等于最高抵押率，小于清算抵押率)颜色red 2监控(抵押率大于等于最高抵押率70%,小于最高抵押率)颜色purple 3健康(抵押率小于最高抵押率70%)颜色blue
    data.status = 2;
    if (data.getMortgageRate >= data.clearingRate) {
      logLiquidationLog(tokenAddress, pTokenAddress, address);
      data.status = 0;
    } else if (data.getMortgageRate >= data.maxRate && data.getMortgageRate < data.clearingRate) {
      data.status = 1;
    } else if (data.getMortgageRate >= data.maxRate * (70 / 100) && data.getMortgageRate < data.maxRate) {
      data.status = 2;
    } else if (data.getMortgageRate < data.maxRate * (70 / 100)) {
      data.status = 3;
    }
  } else if (i == 'nest/pusdt') {
    data.mTitle = 'NEST';
    data.pTitle = 'PUSDT';
    data.key1 = 'nest';
    data.key2 = 'pusdt';
    data.mortgageAssets = BigNumberStr(data.mortgageAssets, 18);
    data.parassetAssets = BigNumberStr(data.parassetAssets, 18);
    data.rate = BigNumberStr(data.rate, 0);
    data.mUsdtPrice = BigNumberStr(priceObj.nest_price * data.mortgageAssets, 0, 6);
    data.pUsdtPrice = BigNumberStr(priceObj.pusdt_price * data.parassetAssets, 0, 6);
    data.maxRate = 70;
    await getMaxRate(address, data.key1).then(async (dataSon) => {
      // console.log('最高抵押率', dataSon);
      data.maxRate = dataSon;
    });
    data.getK = 1.25;
    await getK(address,data.key1).then(async (dataSon) => {
      // console.log("清算线", dataSon);
      data.getK = BigNumberStr(dataSon,3);
    });
    data.clearingRate = BigNumberStr(data.maxRate * data.getK,0,0);
    data.clearingPrice = BigNumberStr(data.mUsdtPrice * data.clearingRate / 100, 0, 6);
    data.getFee = 0;
    data.getKLine = 0;
    data.getMortgageRate = 0;
    await getInfoRealTime(address, data.key1, data.key2, priceObj, data.maxRate).then(async (dataSon) => {
      data.getFee = BigNumberStr(dataSon, 18, 8);
    });
    data.clearingPrice = BigNumberStr((data.parassetAssets * 1 + data.getFee * 1) / (data.mortgageAssets * data.clearingRate / 100), 0, 6);
    data.clearingPriceUnit = 'USDT';
    data.getMortgageRate = BigNumberStr(((data.parassetAssets * 1 + data.getFee * 1) * priceObj.pusdt_price / data.mUsdtPrice) * 100, 0, 6);
    if (data.mortgageAssets * 1 <= 0 || data.mUsdtPrice * 1 <= 0) {
      data.clearingPrice = 0;
      data.getMortgageRate = 0;
    }
    //状态 0待清算(抵押率大于等于清算抵押率) 1预警(抵押率大于等于最高抵押率，小于清算抵押率) 2监控(抵押率大于等于最高抵押率70%,小于最高抵押率) 3健康(抵押率小于最高抵押率70%)
    data.status = 2;
    if (data.getMortgageRate >= data.clearingRate) {
      logLiquidationLog(tokenAddress, pTokenAddress, address);
      data.status = 0;
    } else if (data.getMortgageRate >= data.maxRate && data.getMortgageRate < data.clearingRate) {
      data.status = 1;
    } else if (data.getMortgageRate >= data.maxRate * (70 / 100) && data.getMortgageRate < data.maxRate) {
      data.status = 2;
    } else if (data.getMortgageRate < data.maxRate * (70 / 100)) {
      data.status = 3;
    }
  } else if (i == 'nest/peth') {
    data.mTitle = 'NEST';
    data.pTitle = 'PETH';
    data.key1 = 'nest';
    data.key2 = 'peth';
    data.mortgageAssets = BigNumberStr(data.mortgageAssets, 18);
    data.parassetAssets = BigNumberStr(data.parassetAssets, 18);
    data.rate = BigNumberStr(data.rate, 0);
    data.mUsdtPrice = BigNumberStr(priceObj.nest_price * data.mortgageAssets, 0, 6);
    data.pUsdtPrice = BigNumberStr(priceObj.peth_price * data.parassetAssets, 0, 6);
    data.maxRate = 70;
    await getMaxRate(address, data.key1).then(async (dataSon) => {
      // console.log('最高抵押率', dataSon);
      data.maxRate = dataSon;
    });
    data.getK = 1.25;
    await getK(address,data.key1).then(async (dataSon) => {
      // console.log("清算线", dataSon);
      data.getK = BigNumberStr(dataSon,3);
    });
    data.clearingRate = BigNumberStr(data.maxRate * data.getK,0,0);
    data.clearingPrice = BigNumberStr(data.mUsdtPrice * data.clearingRate / 100, 0, 6);
    data.getFee = 0;
    await getInfoRealTime(address, data.key1, data.key2, priceObj, data.maxRate).then(async (dataSon) => {
      data.getFee = BigNumberStr(dataSon, 18, 8);
    });
    data.getKLine = 0;
    data.getMortgageRate = 0;
    await getFeeDebt(address, data.parassetAssets, data.blockHeight, data.rate).then(async (dataSon) => {
      data.getFee = BigNumberStr(dataSon, 18, 8);
    });
    data.clearingPrice = BigNumberStr((data.parassetAssets * 1 + data.getFee * 1) / (data.mortgageAssets * data.clearingRate / 100), 0, 6);
    data.clearingPriceUnit = 'ETH';
    data.getMortgageRate = BigNumberStr(((data.parassetAssets * 1 + data.getFee * 1) * priceObj.peth_price / data.mUsdtPrice) * 100, 0, 6);
    if (data.mortgageAssets * 1 <= 0 || data.mUsdtPrice * 1 <= 0) {
      data.clearingPrice = 0;
      data.getMortgageRate = 0;
    }
    //状态 0待清算(抵押率大于等于清算抵押率) 1预警(抵押率大于等于最高抵押率，小于清算抵押率) 2监控(抵押率大于等于最高抵押率70%,小于最高抵押率) 3健康(抵押率小于最高抵押率70%)
    data.status = 2;
    if (data.getMortgageRate >= data.clearingRate) {
      logLiquidationLog(tokenAddress, pTokenAddress, address);
      data.status = 0;
    } else if (data.getMortgageRate >= data.maxRate && data.getMortgageRate < data.clearingRate) {
      data.status = 1;
    } else if (data.getMortgageRate >= data.maxRate * (70 / 100) && data.getMortgageRate < data.maxRate) {
      data.status = 2;
    } else if (data.getMortgageRate < data.maxRate * (70 / 100)) {
      data.status = 3;
    }
  }
  // }
}


const getLatestPrice = (account) => {
  return new Promise(async (resolve, reject) => {
    try {
      let eth_price = await nestQueryContract.methods.triggeredPriceInfo(config.usdtToken).call({from: account});
      let eth_nest_price = await nestQueryContract.methods.triggeredPriceInfo(config.nestToken).call({from: account});
      var obj = {};
      // console.log('price',eth_price,eth_nest_price)
      obj.eth_price = BigNumberStr(eth_price.avgPrice,6);
      obj.eth_nest_price = BigNumberStr(eth_nest_price.avgPrice,18);

      // obj.eth_price = 2;
      // obj.eth_nest_price = 3;
      obj.eth_eth_price = 1;
      obj.nest_eth_price = 1/obj.eth_nest_price;
      //对u的价格
      obj.usdt_price = 1;
      obj.nest_price = obj.eth_price/obj.eth_nest_price;
      obj.pusdt_price = 1;
      obj.peth_price = obj.eth_price;
      //store.js使用 eth本位计算
      obj.usdt = obj.eth_price;
      obj.nest = obj.eth_nest_price;
      // console.log('price',obj)
      resolve(obj);
    } catch (e) {
      reject(e);
    }
  });
};


// 债仓页 计算稳定费
// parassetAssets:债务资产数量
// blockHeight:上次操作区块
// rate:抵押率
const getFeeDebt = (account, parassetAssets, blockHeight, rate) => {
  return new Promise(async (resolve, reject) => {
    try {
      parassetAssets = BigNumberMul(parassetAssets, Math.pow(10, 18));
      // rate = BigNumberMul(rate, Math.pow(10, 18));
      // console.log('计算稳定费',parassetAssets, blockHeight, rate)
      let rs1 = await mortgagePoolContract.methods.getFee(parassetAssets, blockHeight, rate).call({from: account});
      resolve(rs1);
    } catch (e) {
      reject(e);
    }
  });
};

const getInfoRealTime = (account, mortgageTokenType, pTokenType, priceObj, maxRateNum) => {
  return new Promise(async (resolve, reject) => {
    try {
      // console.log(mortgageTokenType, pTokenType, priceObj, maxRateNum,account);
      // console.log(amount);
      let tokenPrice = 0;
      let uTokenPrice = 0;
      let pToken = '';
      let mortgageToken = '';
      if (mortgageTokenType == 'eth') {
        mortgageToken = ethToken;
        tokenPrice = BigNumberMul(priceObj.eth_eth_price, Math.pow(10, 18),0);
      } else if (mortgageTokenType == 'nest') {
        mortgageToken = nestToken;
        tokenPrice = BigNumberMul(priceObj.eth_nest_price, Math.pow(10, 18),0);
      }
      if (pTokenType == 'peth') {
        pToken = pethToken;
        uTokenPrice = BigNumberMul(priceObj.eth_eth_price, Math.pow(10, 18),0);
      } else if (pTokenType == 'pusdt') {
        pToken = pusdtToken;
        uTokenPrice = BigNumberMul(priceObj.eth_price, Math.pow(10, 6),0);
      }
      // console.log(mortgageToken, pToken, uTokenPrice, tokenPrice, maxRateNum,account);
      let rs1 = await mortgagePoolContract.methods.getInfoRealTime(mortgageToken, pToken, tokenPrice, uTokenPrice, maxRateNum,account).call({from: account});
      resolve(rs1);
    } catch (e) {
      reject(e);
    }
  });
};

/*
* 执行清仓
* */
const logLiquidationLog = async (tokenAddress, pTokenAddress, address, amount) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(`logLiquidationLog time:(${Date.parse(new Date())}) log:`, tokenAddress, pTokenAddress, address, account.address)
      let value = "10000000000000000";
      if (tokenAddress === config.ethToken) {
        value = "20000000000000000";
      }
      // 清仓
      // if (address === '0xB8705Eb08Fb24FE0Ba9a98bf31693755F3eE8B68' && tokenAddress === config.nestToken) {
      const tx = {
        // this could be provider.addresses[0] if it exists
        from: account.address,
        // target address, this could be a smart contract address
        to: config.mortgagePoolAddress,
        // optional if you want to specify the gas limit
        gas: 600000,
        // optional if you are invoking say a payable function
        value,
        // this encodes the ABI of the method and the arguements
        data: mortgagePoolContract.methods.liquidation(tokenAddress, pTokenAddress, address, amount).encodeABI()
      };
      web3.eth.accounts.signTransaction(tx, config.privateKey).then((signedTx) => {
        // raw transaction string may be available in .raw or
        // .rawTransaction depending on which signTransaction
        // function was called
        const sentTx = web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
        // sentTx.on('transactionHash', hash => {
        //   console.log('___hash', hash, tokenAddress, pTokenAddress, address, account.address);
        // });

        sentTx.on("receipt", receipt => {
          console.log('sentTx receipt:', receipt, tokenAddress, pTokenAddress, address, account.address)
          mysqlConnect.query(`
            INSERT INTO logLiquidationLog ( tokenAddress, pTokenAddress, address, hash )
             VALUES
             ( '${tokenAddress}', '${pTokenAddress}', '${address}', '${receipt.transactionHash}');
          `);
          resolve(true);
          // do something when receipt comes back
        });

        sentTx.on("error", err => {
          console.log('sentTx error:', err, tokenAddress, pTokenAddress, address, account.address)
          reject(err);
          // do something on transaction error
        });

      }).catch((err) => {
        console.log('signTransaction err:', err, tokenAddress, pTokenAddress, address, account.address)
        reject(err);
        // do something when promise fails

      });
      // }

    }catch (e) {
      reject(e);
      console.log('logLiquidationLog err:', e)
    }
  });

}


/*铸币 查看最高抵押率 */
const getMaxRate = (account, mortgageTokenType) => {
  return new Promise(async (resolve, reject) => {
    try {
      let mortgageToken = '';
      if (mortgageTokenType == 'eth') {
        mortgageToken = ethToken;
      } else if (mortgageTokenType == 'nest') {
        mortgageToken = nestToken;
      }
      let rs1 = await mortgagePoolContract.methods.getMaxRate(mortgageToken).call({from: account});
      rs1 = BigNumberStr(rs1,18)*100;
      resolve(rs1);
    } catch (e) {
      reject(e);
    }
  });
};

// 查看清算线
const getK = (account, mortgageTokenType) => {
  return new Promise(async (resolve, reject) => {
    try {
      let mortgageToken = '';
      if (mortgageTokenType == 'eth') {
        mortgageToken = ethToken;
      } else if (mortgageTokenType == 'nest') {
        mortgageToken = nestToken;
      }
      let rs1 = await mortgagePoolContract.methods.getK(mortgageToken).call({from: account});
      resolve(rs1);
    } catch (e) {
      reject(e);
    }
  });
};


module.exports = router;
