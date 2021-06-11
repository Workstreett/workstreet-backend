
var express = require('express');
var app = express();
var pool=require('./db');
app.use(express.json({strict:false}));
app.use(express.urlencoded({extended:true}));

app.post('/signup',async (req,res)=>{
try{
  var signUp_items=req.body;
  var newMember = await pool.query("INSERT INTO signup_table(username,password,confirmPassword,fullName,branch,year,mailId,institute) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
  [signUp_items.username,signUp_items.password,signUp_items.fullName,signUp_items.branch,signUp_items.year,signUp_items.mailId,signUp_items.institute]
  );
  res.json(newMember);
  res.send('error1');
}
catch(err){
 console.error(err.message);

 res.send('error2');
}
});
app.listen(3000);
console.log("I am listening sir");

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

api.post("/login", (req, res) => {
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

