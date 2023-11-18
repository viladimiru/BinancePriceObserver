export enum Language {
	Ru = 'ru',
	En = 'en',
}

export function isLanguage(language: string): language is Language {
	return Object.values(Language).includes(language as Language);
}

export function getValidatedLanguage(language: string | undefined): Language {
	switch (language) {
		case Language.En:
			return Language.En;
		case Language.Ru:
			return Language.Ru;
		default:
			return Language.En;
	}
}
