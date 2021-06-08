const express = require("express");
require("dotenv").config();

const api = express();
api.use(express.json({ strict: false }));
api.use(express.urlencoded({ extended: false }));

api.get("/", (req, res) => {
	res.send(
		"Hello Jeremy here!!! I am  here to help person login and signup at workstreet application"
	);
});

api.post("/signup", (req, res) => {
	// The given data includes username, password, confirm, name, branch, year, email, institute....
	const { username, password, name, branch, year, email, institute } =
		req.body;

	res.status(200);
	res.send(
		`${username} ${password} ${name} ${branch} ${year} ${email} ${institute}`
	);
});

const PORT = process.env.PORT;
// console.log(process.env.db_passwd);
api.listen(PORT);
