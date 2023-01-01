import { FEEDBACK } from '../sequelize.js';

async function addFeedback(msg) {
  await FEEDBACK.create({
    msg: JSON.stringify(msg)
  })
}

export default {
  addFeedback
}