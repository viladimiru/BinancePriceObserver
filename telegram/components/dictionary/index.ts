import ru from './lang/ru';
import en from './lang/en';
import { type Language, getValidatedLanguage } from '../../entities/language';

const LANG_MAP: {
	[Language.Ru]: typeof ru;
	[Language.En]: typeof en;
} = {
	ru,
	en,
};

export function dictionary(language: string | undefined): typeof ru | typeof en {
	const validatedLanguage = getValidatedLanguage(language);
	return LANG_MAP[validatedLanguage];
}
