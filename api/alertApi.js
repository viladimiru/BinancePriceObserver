import { PAIR, PRICE, SPIKE } from '../repository/index.js'

async function deleteAlerts(chatId, symbol) {
  const promises = [
    PRICE.destroy({
      where: {
        chatId: chatId
      },
      include: {
        model: PAIR,
        where: {
          symbol: symbol
        }
      }
    }),
    SPIKE.destroy({
      where: {
        chatId: chatId
      },
      include: {
        model: PAIR,
        where: {
          symbol: symbol
        }
      }
    }),
  ]
  return await Promise.all(promises)
}

export default {
  deleteAlerts
}