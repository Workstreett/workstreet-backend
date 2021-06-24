var express = require("express");
var app = express();
var pool = require("./db");
var validation = require("./validation");
var endpoint = require("./endpoint");
const jwt = require("jsonwebtoken");
const { prototype } = require("nodemailer/lib/dkim");
const e = require("express");
require("dotenv").config();
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

app.post("/signup", async (req, res) => {
	try {
		var signUp_items = req.body;
		// console.log(signUp_items);
		var checker = await endpoint.signUpChecker(signUp_items);
		// checker returns -1 for not valid  username, -2 for not valid password,-3 for not eligible mail id,1 if acceptable
		if (checker == 1) {
			let hashedPsswd = validation.hashPassword(signUp_items.password);
			signUp_items.password = hashedPsswd;
			var newMember = await pool.query(
				`INSERT INTO ${process.env.db_table} (username,password,fullname,branch,year,officialmailid,institute) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
				[
					signUp_items.username,
					hashedPsswd,
					signUp_items.fullname,
					signUp_items.branch,
					signUp_items.year,
					signUp_items.officialmailid,
					signUp_items.institute,
				]
			);

			endpoint.mailer(signUp_items);
			res.json(newMember);
		} else {
			if (checker == -1) console.log("chosen username already exists");
			else if (checker == -2) console.log("password rules not satisfied");
			else if (checker == -3) console.log("not eligible mail id");
			res.send(`sorry ${checker}`);
		}
	} catch (err) {
		console.error(err.message);
		res.send("error2");
	}
});

app.get("/verify/:jwt", (req, res) => {
	token = req.params.jwt;
	token = endpoint.decrypt(token);
	user_data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
	pool.query(
		`UPDATE ${process.env.db_table} SET verified=true WHERE username=$1`,
		[user_data.username],
		(err, res) => {
			if (err) {
				console.log(err.message);
			} else {
				console.log(res);
			}
		}
	);
	res.send(user_data);
});

app.post("/login", async (req,res) =>{
    try{
		var login_items=req.body;
		var finder = await pool.query(`SELECT * FROM ${process.env.db_table} WHERE username=$1`,[login_items.username]);
		if(finder.rows[0]==undefined) console.log(`user with name ${login_items.username} does not exist`);
        else if(!finder.rows[0].verified) console.log(`user with name ${login_items.username} not verified`);
		else{
			let hashedPsswd = validation.hashPassword(login_items.password);
			if(hashedPsswd==finder.rows[0].password){ 
				var token = jwt.sign(finder.rows[0], process.env.ACCESS_TOKEN_SECRET, {
					expiresIn: "15 days",
				});
				token = endpoint.encrypt(token);
				console.log(token);
				console.log(`user with name ${login_items.username} correct password`);
				
			}
            else console.log(`user with name ${login_items.username} wrong password`)
		}
		res.json(finder);
	}
    catch(err){
		console.error(err.message);
	}


});

app.get("/", (req, res) => {
	res.send("Hello Jeremy Here! want to have a talk contact us!!!!!");
});

console.log("I am listening sir");
const PORT = process.env.PORT;
// console.log(process.env.db_passwd);
app.listen(PORT || 3000);
