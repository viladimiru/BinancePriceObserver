import dict from '../dict/index.js'

export function keyboardWrapper(keyboard = [], options = {}, hideBackBtn) {
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
				text: dict.back,
			},
		]);
	}
	return result;
}

export async function asyncKeyboardWrapper(
  keyboard = async () => {},
  options = {},
  hideBackBtn
) {
  if (typeof keyboard === 'function') {
    const _keyboard = await keyboard()
    return keyboardWrapper(_keyboard, options, hideBackBtn)
  }
  throw new Error('Invalid keyboard argument [Should be function]')
}