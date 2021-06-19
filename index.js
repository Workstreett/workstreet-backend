var express = require("express");
var app = express();
var pool = require("./db");
require("dotenv").config();
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

app.post("/signup", async (req, res) => {
	try {
		var signUp_items = req.body;
		var newMember = await pool.query(
			"INSERT INTO wk_table(username,password,fullName,branch,year,mailId,institute) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
			[
				signUp_items.username,
				signUp_items.password,
				signUp_items.fullName,
				signUp_items.branch,
				signUp_items.year,
				signUp_items.mailId,
				signUp_items.institute,
			]
		);
		res.json(newMember);
	} catch (err) {
		console.error(err.message);
		res.send("error2");
	}
});
console.log("I am listening sir");
const PORT = process.env.PORT;
// console.log(process.env.db_passwd);
app.listen(PORT);
