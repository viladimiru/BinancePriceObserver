export interface UserCreationEntity {
	userId: number;
	chatId: number;
	firstName?: string;
	username?: string;
	lang: string;
	isPrivate: boolean;
	date: number;
}

export interface UserEntity extends UserCreationEntity {}
