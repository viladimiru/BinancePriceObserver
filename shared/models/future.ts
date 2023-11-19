export interface FuturePrice {
	symbol: string;
	markPrice: number;
}

export type GetChatPairPrices = (arg1: { chatId: number }) => Promise<FuturePrice[] | null>;
export type IsFutureExist = (arg1: { symbol: string }) => Promise<boolean>;
