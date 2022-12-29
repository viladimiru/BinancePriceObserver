import { readFileSync, writeFileSync } from 'fs'

export function getPairs() {
  return JSON.parse(readFileSync('./pairs.json'))
}

export function addPair(symbol, type, price, chatId) {
  const _pairs = getPairs() || {}

  symbol = symbol.toUpperCase()
  price = Number(price)

  if (_pairs[symbol]) {
    const triggers = _pairs[symbol].triggers.find(item => item.chatId === chatId)
    if (triggers) {
      if (triggers.values.find(([ t, p ]) => type === t && price === p)) {
        return
      } else {
        triggers.values.push([
          type, price
        ])
      }
    } else {
      _pairs[symbol].triggers.push({
        chatId: chatId,
        values: [
          type, price
        ]
      })
    }
  }

  if (!_pairs[symbol]) {
    _pairs[symbol] = {
      triggers: [
        {
          chatId: chatId,
          values: [
            [ type, price ]
          ]
        }
      ]
    }
  }

  writeFileSync('./pairs.json', JSON.stringify(_pairs))
}

export function removePair(symbol, chatId, value) {
  const _pairs = getPairs()
  const triggers = _pairs[symbol].triggers
  const triggerIndex = triggers.findIndex(item => item.chatId === chatId)

  const valueIndex = triggers[triggerIndex].values.findIndex(([ t, p ]) => t === value[0] && p === value[1])
  triggers[triggerIndex].values.splice(valueIndex, 1)

  if (triggers[triggerIndex].values.length === 0) {
    triggers.splice(triggerIndex, 1)
  }

  if (_pairs[symbol].triggers.length === 0) {
    delete _pairs[symbol]
  }

  writeFileSync('./pairs.json', JSON.stringify(_pairs))
  return _pairs
}

let pairs = readFileSync('./pairs.json')