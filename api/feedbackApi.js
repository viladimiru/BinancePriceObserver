import { FEEDBACK } from '../repository/index.js';

async function addFeedback(msg) {
  await FEEDBACK.create({
    msg: JSON.stringify(msg)
  })
}

async function getAll() {
  const res = await FEEDBACK.findAll()
  res.forEach(item => item.msg = JSON.parse(item.msg))
  return res
}

export default {
  addFeedback,
  getAll
}