import emoji from '../emoji.js'

export default {
  addObserver: 'Добавить уведомление ' + emoji.eyes,
  removeObserver: 'Удалить уведомление ' + emoji.trash,
  short: 'Short',
  long: 'Long',
  back: emoji.leftArrow + ' Назад',
  symbol: 'Название пары (к примеру BTCUSDT)',
  completed: '<b>Готово!</b>\n\nКак только отследим введённую сумму мы пришлем вам уведомление!',
  toTheMain: 'На главную',
  error: 'Я вас не понимаю',
  above: 'Выше ' + emoji.above,
  below: 'Ниже ' + emoji.below,
  sendMessageWhen: 'Прислать сообщение когда цена будет выше/ниже',
  pairNotExists: 'Такой пары не существует',
  enterAlertPrice: 'Введите сумму, после которой хотите получить уведомление ' + emoji.bell,
  alertPriceError: 'Вводите только цифры (15000.00)',
  messageTemplate: 'Напишите сообщение, которое хотите получить',
  messageTemplates: [
    [emoji.siren, 'STOP LOSS', emoji.siren].join(' '),
    [emoji.bigMoney, 'TAKE PROFIT', emoji.bigMoney].join(' ')
  ],
  pairSuccessfullyCreated: 'Пара успешно добавлена',
  chooseRemovalPair: 'Выберите пару, которую хотите удалить',
  youNotCreatedThisPair: 'Вы не создавали такой пары',
  pairSuccessfullyRemoved: 'Пара успешно удалена',
  tradeSuccessfullyRemoved: 'Сделка успешно удалена из списка',
  iDontUnderstand: 'Я вас не понимаю',
  quotes: 'Котировки ' + emoji.spike,
  loadingQuotes: 'Загрузка цен ' + emoji.imagine,
  start: 'Запуск',
  listIsEmpty: 'Список пуст ' + emoji.ufo,
  spiking: 'Скачки цен ' + emoji.spike,
  update: 'Обновить ' + emoji.thinking,
  tradeType: 'Выберите тип сделки',
  tradePrice: 'Введите цену входа',
  tradeCreated: '<b>Сделка успешно добавлена в список</b>\n\nТеперь вы сможете следить за динамикой в котировках',
  addTrade: 'Добавить сделку ' + emoji.dollar,
  removeTrade: 'Удалить сделку ' + emoji.trash,
  shoulder: 'Размер плеча',
  feedback: 'Вы можете оценить данного бота, оставить запрос на расширение функционала или пожаловаться на недоработки, мы обязательно примем всё во внимание',
  thanksForFeedback: 'Спасибо! Сообщение передано администратору',
  leaveFeedback: 'Отзыв ' + emoji.pen,
  selectDesiredFunction: '<b>Выберите нужную функцию</b>',
  quotesFetchError: 'Ошибка запроса\nПовторите попытку'
}