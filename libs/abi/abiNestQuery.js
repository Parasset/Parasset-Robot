let abiNestQuery = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "getConfig",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint16",
						"name": "singleFee",
						"type": "uint16"
					},
					{
						"internalType": "uint16",
						"name": "doubleFee",
						"type": "uint16"
					},
					{
						"internalType": "uint8",
						"name": "normalFlag",
						"type": "uint8"
					}
				],
				"internalType": "struct NestQuery.Config",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint128",
				"name": "_avg",
				"type": "uint128"
			}
		],
		"name": "setAvg",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "singleFee",
				"type": "uint16"
			},
			{
				"internalType": "uint16",
				"name": "doubleFee",
				"type": "uint16"
			},
			{
				"internalType": "uint8",
				"name": "normalFlag",
				"type": "uint8"
			}
		],
		"name": "setConfig",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "ntoken",
				"type": "address"
			}
		],
		"name": "setNTokenMapping",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "paybackAddress",
				"type": "address"
			}
		],
		"name": "triggeredPriceInfo",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "blockNumber",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "avgPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "sigmaSQ",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			}
		],
		"name": "triggeredPriceInfo",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "blockNumber",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "avgPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "sigmaSQ",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "paybackAddress",
				"type": "address"
			}
		],
		"name": "triggeredPriceInfo2",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "blockNumber",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "avgPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "sigmaSQ",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ntokenBlockNumber",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ntokenPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ntokenAvgPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ntokenSigmaSQ",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			}
		],
		"name": "triggeredPriceInfo2",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "blockNumber",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "avgPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "sigmaSQ",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ntokenBlockNumber",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ntokenPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ntokenAvgPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ntokenSigmaSQ",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
module.exports = abiNestQuery
