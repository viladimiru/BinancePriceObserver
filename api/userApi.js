import { USER } from '../repository/index.js';

/**
 * User creation
 * @param {*} msg
 */
async function createUser(msg) {
  const payload = {
    userId: msg.from.id,
    firstName: msg.from.first_name,
    username: msg.chat.username,
    lang: msg.from.language_code,
    isPrivate: msg.chat.type === 'private',
    date: msg.date,
    chatId: msg.chat.id
  }

  await USER.findOrCreate({
    where: {
      userId: msg.from.id
    },
    defaults: payload
  })
}

export default {
	createUser,
};
