import dotenv from 'dotenv';
dotenv.config();

export function isAuthed(req, res, next) {
	const { authentication } = req.headers;
	if (authentication && authentication === 'Bearer ' + process.env.API_TOKEN) {
		return next();
	}
	res.status(401).send({
		error: 'Auth error',
	});
}
