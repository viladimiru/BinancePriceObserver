import { describe, expect, test } from '@jest/globals';
import { type KeyboardWrapperOptions, keyboardWrapper, asyncKeyboardWrapper } from './keyboard';
import { type KeyboardButton } from 'node-telegram-bot-api';
import { dictionary } from '../dictionary/index';

type KeyboardWrapperReturnType = ReturnType<typeof keyboardWrapper>;
interface TestCase {
	buttons: KeyboardButton[];
	options: KeyboardWrapperOptions;
	hasHiddenGoBackButton: boolean;
	getExpectedResult: () => KeyboardWrapperReturnType;
}

describe('keyboard module test', () => {
	const buttons = [{ text: 'text' }];
	const options = { language_code: 'ru' };

	const expectedResultWrapper = (keyboard: KeyboardButton[][]): KeyboardWrapperReturnType => ({
		reply_markup: {
			resize_keyboard: true,
			one_time_keyboard: true,
			keyboard,
		},
	});

	const keyboardTestCases: TestCase[] = [
		{
			buttons,
			options,
			hasHiddenGoBackButton: true,
			getExpectedResult() {
				return expectedResultWrapper([this.buttons]);
			},
		},
		{
			buttons,
			options,
			hasHiddenGoBackButton: false,
			getExpectedResult() {
				return expectedResultWrapper([
					this.buttons,
					[
						{
							text: dictionary(options.language_code).back,
						},
					],
				]);
			},
		},
	];

	keyboardTestCases.forEach((testCase) => {
		test('keyboardWrapper function', () => {
			const result = keyboardWrapper(
				[testCase.buttons],
				testCase.options,
				testCase.hasHiddenGoBackButton
			);
			expect(result).toEqual(testCase.getExpectedResult());
		});
	});

	keyboardTestCases.forEach((testCase) => {
		test('asyncKeyboardWrapper function', () => {
			const asyncButtons = new Promise<KeyboardButton[][]>((resolve) => {
				resolve([testCase.buttons]);
			});
			asyncKeyboardWrapper(
				async (): Promise<KeyboardButton[][]> => await asyncButtons,
				testCase.options,
				testCase.hasHiddenGoBackButton
			).then((result) => {
				expect(result).toEqual(testCase.getExpectedResult());
			});
		});
	});
});
