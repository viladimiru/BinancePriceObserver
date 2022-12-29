import { ADD_OBSERVER, SHORT, LONG, BACK, SYMBOL, COMPLETED, TO_THE_MAIN, ERROR } from './dict.js';

let observer
let chain = [];
let pair = {
  symbol: null,
  type: null,
  price: null
}

const keyboardTree = {
	start: {
		state: keyboardWrapper(
			[
				[
					{
						text: ADD_OBSERVER,
					},
				],
			],
			{},
			true
		),
		text: '<b>Добро пожаловать!</b>\nВыберите нужную опцию',
		[ADD_OBSERVER]: {
      state: keyboardWrapper(),
			text: SYMBOL,
			[SYMBOL]: {
				state: keyboardWrapper([
					[
						{
							text: LONG,
						},
						{
							text: SHORT,
						},
					],
				]),
				text: 'Выберите тип сделки',
				[LONG]: {
					state: keyboardWrapper(),
					text: 'Введите сумму, после которой хотите получить уведомление',
				},
				[SHORT]: {
					state: keyboardWrapper(),
					text: 'Введите сумму, после которой хотите получить уведомление',
				},
			},
		},
		[COMPLETED]: {
			text: COMPLETED,
			state: keyboardWrapper([
        [
          {
            text: TO_THE_MAIN
          }
        ]
      ], {}, true),
		},
	},
};

export function getCurrentKeyboard() {
	return getCurrentNode().state;
}

export function getCurrentStepMessage() {
	return getCurrentNode().text;
}

export function setNextState(nextState) {
  if (getLastState() === SYMBOL) {
    pair.type = nextState
	}

  if (nextState === TO_THE_MAIN) {
    chain = []
  } else if (nextState === BACK) {
		back();
	} else if ([LONG, SHORT].includes(getLastState())) {
		chain = [COMPLETED];
    pair.price = Number(nextState)
    observer(pair)
	} else if (getLastState() === ADD_OBSERVER) {
		chain.push(SYMBOL);
    pair.symbol = nextState
	} else if (validateNextState(nextState)) {
		chain.push(nextState);
	}

  if (getCurrentNode().action) {
    getCurrentNode().action()
  }
}

export function back() {
	chain.pop();
}

export function setObserver(obs) {
  observer = obs
}

function validateNextState(nextState) {
	const _chain = [...chain, nextState];
	let node = keyboardTree.start;
	try {
		_chain.forEach((item) => {
			node = node[item];
		});
		return !!node;
	} catch (e) {
		return false;
	}
}

function keyboardWrapper(keyboard = [], options = {}, hideBackBtn) {
	const result = {
		reply_markup: {
			resize_keyboard: true,
			one_time_keyboard: true,
			keyboard: keyboard,
			...options,
		},
	};
	if (!hideBackBtn) {
		result.reply_markup.keyboard.push([
			{
				text: BACK,
			},
		]);
	}
	return result;
}

function getCurrentNode() {
	if (chain.length) {
		let node = keyboardTree.start;
		chain.forEach((item) => {
			node = node[item];
		});
		return node;
	}
	return keyboardTree.start;
}

function getLastState() {
	return chain[chain.length - 1];
}

function addLong() {
  console.log('sukaa')
}

