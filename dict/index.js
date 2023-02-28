import ru from './lang/ru.js';
import en from './lang/en.js';

const LANG_MAP = {
	ru,
	en,
};

export function dictionary(language) {
	return LANG_MAP[language || 'en'];
}
