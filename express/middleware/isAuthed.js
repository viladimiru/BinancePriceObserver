import dotenv from 'dotenv'
dotenv.config()

export function isAuthed(req, res, next) {
	const {authentication} = req.headers
	if (authentication && authentication === 'Bearer ' + process.env.API_TOKEN) {
		return next()
	}
	const error = new Error('Auth error')
	error.status = 404
	res.status(401).send({
		error: 'Auth error'
	})
}