import type TelegramBot from 'node-telegram-bot-api';
import { dictionary } from '../dictionary/index';
import { type ReplyKeyboardMarkup } from 'node-telegram-bot-api';
import lodash from 'lodash';

export type ReplyMarkupReturnType = Pick<TelegramBot.SendMessageOptions, 'reply_markup'>;
export interface KeyboardWrapperOptions extends TelegramBot.SendMessageOptions {
	language_code: string;
}

export function keyboardWrapper(
	keyboard: ReplyKeyboardMarkup['keyboard'],
	options: KeyboardWrapperOptions,
	hiddenBackButton = false
): ReplyMarkupReturnType {
	const result = {
		reply_markup: {
			resize_keyboard: true,
			one_time_keyboard: true,
			keyboard,
			...lodash.omit(options, ['language_code']),
		},
	};
	if (!hiddenBackButton) {
		result.reply_markup.keyboard.push([
			{
				text: dictionary(options.language_code).back,
			},
		]);
	}
	return result;
}

export async function asyncKeyboardWrapper(
	asyncKeyboard: () => Promise<ReplyKeyboardMarkup['keyboard']>,
	options: KeyboardWrapperOptions,
	hiddenBackButton: boolean
): Promise<ReplyMarkupReturnType> {
	const keyboard = await asyncKeyboard();
	return keyboardWrapper(keyboard, options, hiddenBackButton);
}
