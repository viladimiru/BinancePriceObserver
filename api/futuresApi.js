import axios from 'axios';

async function getPairIndex(symbol) {
  return await axios.get('https://fapi.binance.com/fapi/v1/premiumIndex', {
    params: {
      symbol: symbol
    }
  })
}


export default {
  getPairIndex
}