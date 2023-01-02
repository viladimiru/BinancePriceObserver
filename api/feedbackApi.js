import { FEEDBACK } from '../repository/index.js';

async function addFeedback(msg) {
  await FEEDBACK.create({
    msg: JSON.stringify(msg)
  })
}

export default {
  addFeedback
}