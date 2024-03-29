const fs = require("fs");
var express = require("express");
var app = express();
var pool = require("./db");
var cors = require("cors");
var validation = require("./validation");
var endpoint = require("./endpoint");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const funcs = require("./helperFunctions");
var sendpulse = require("sendpulse-api");

require("dotenv").config();

const multerConfg = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./uploads/");
	},
	filename: (req, file, cb) => {
		var name = file.originalname;
		var ext = name.substring(name.lastIndexOf("."));
		cb(null, `${req.body.company}_${req.body.title}${ext}`);
	},
});
const upload = multer({ storage: multerConfg });
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.post("/signup", upload.none(), async (req, res) => {
	try {
		var signUp_items = req.body;
		var checker = await endpoint.signUpChecker(signUp_items);
		// checker returns -1 for not valid  username, -2 for not valid password,-3 for not eligible mail id,1 if acceptable
		if (checker == 1) {
			let hashedPsswd = validation.hashPassword(signUp_items.password);
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
			endpoint.mailer(newMember.rows[0]);
			console.log(res.headersSent);
			// console.log("SenT!!!");
			res.send("signedUp");
		} else {
			if (checker == -1) res.send("u");
			else if (checker == -2) res.send("p");
			else if (checker == -3) res.send("m");
		}
	} catch (err) {
		console.error(err.message);
		res.send("error");
	}
});

app.get("/verify/:jwt", upload.none(), (req, res) => {
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
				console.log("User Verified");
			}
		}
	);
	res.send(user_data);
});

app.post("/login", upload.none(), async (req, res) => {
	try {
		var token = undefined;
		var verified = true;
		var login_items = req.body;
		var finder = await pool.query(
			`SELECT * FROM ${process.env.db_table} WHERE username=$1`,
			[login_items.username]
		);
		if (finder.rows[0] == undefined)
			console.log(
				`user with name ${login_items.username} does not exist`
			);
		else if (!finder.rows[0].verified) {
			console.log(`user with name ${login_items.username} not verified`);
			verified = false;
		} else {
			let hashedPsswd = validation.hashPassword(login_items.password);
			if (hashedPsswd == finder.rows[0].password) {
				token = jwt.sign(
					finder.rows[0],
					process.env.ACCESS_TOKEN_SECRET,
					{
						expiresIn: "15 day",
					}
				);
				token = endpoint.encrypt(token);
				console.log(
					`user with name ${login_items.username} correct password`
				);
			} else
				console.log(
					`user with name ${login_items.username} wrong password`
				);
		}
		if (!verified) {
			res.send("V");
		} else if (token == undefined) {
			res.send("U");
		} else {
			let details = finder.rows[0];
			delete details["password"];
			details.authToken = token;
			res.json(details);
		}
	} catch (err) {
		console.error(err.message);
	}
});

app.post("/auth", upload.none(), (req, res) => {
	try {
		let token = req.body.auth_token;
		if (token == undefined) {
			res.send("No");
			return 0;
		}
		token = endpoint.decrypt(token);
		let data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		if (data.user_id != undefined) {
			res.send("Yes");
		} else {
			res.send("No");
		}
	} catch (err) {
		res.send("No");
		console.log(err);
	}
});

app.post("/user", upload.none(), (req, res) => {
	try {
		let user = req.body;
		if (user.user_id === undefined) {
			res.send("The User can't be updated");
			return;
		}
		pool.query(
			`UPDATE ${process.env.db_table} SET fullname=$1, branch=$2, year=$3, institute=$4 WHERE user_id=$5`,
			[
				user.fullname,
				user.branch,
				user.year,
				user.institute,
				user.user_id,
			],
			(err, req) => {
				if (err) {
					console.log(err.message);
				}
				console.log(req.rows);
				res.send("Updated the user");
			}
		);
	} catch (err) {
		res.send("Sorry The user can't be updated");
	}
});

app.post("/admin/update", upload.single("image"), (req, res) => {
	try {
		if (req.body.oldSection != req.body.section) {
			const fileName = req.body.oldSection.toLowerCase();
			const newFileName = req.body.section.toLowerCase();
			const ind = req.body.id;
			const imageName = funcs.deleteImageIfRequired(
				fileName,
				ind,
				req.body.company,
				req.body.title,
				req.file
			);
			funcs.deletePost(fileName, ind, false);
			funcs.creatPost(newFileName, req.body, imageName);
		} else {
			const fileName = req.body.section.toLowerCase();
			const ind = req.body.id;
			const imageName = funcs.deleteImageIfRequired(
				fileName,
				ind,
				req.body.company,
				req.body.title,
				req.file
			);
			var data = require(fileName);
			var obj = req.body;
			data[ind] = {
				title: obj.title,
				company: obj.company,
				desc: obj.desc,
				extra: obj.extra,
				url: obj.url,
				tags: obj.tags,
				compUrl: obj.compUrl,
				img: imageName,
			};
			fs.writeFileSync(
				`./company_data/${fileName}.json`,
				JSON.stringify(data)
			);
		}
		res.send("Updated Data");
	} catch (err) {
		res.send("Sorry The company_des can't be updated");
	}
});

app.post("/admin/create", upload.single("image"), (req, res) => {
	// obj includes section,title,company,desc,extra,url,tags
	try {
		var obj = req.body;
		const file_name = req.body.section.toLowerCase();
		funcs.creatPost(file_name, obj, req.file.filename);
		res.send("Added a Post");
	} catch (err) {
		console.log(err.message);
		res.send("Error");
	}
});

app.post("/admin/delete", upload.none(), (req, res) => {
	// req.body includes the id of the object,section to be deleted.
	try {
		const ind = req.body.id;
		funcs.deletePost(req.body.section.toLowerCase(), ind, true);
		res.send("Deleted!!!");
	} catch (err) {
		console.log(err.message);
		res.send("Error");
	}
});

app.post("/admin/read", upload.none(), (req, res) => {
	try {
		let to_read = req.body;
		let profile = to_read.section;
		let filename = "./company_data/" + profile.toLowerCase() + ".json";
		let jobs = [];
		jobs = JSON.parse(fs.readFileSync(filename, "utf-8"));
		res.send(jobs);
	} catch (err) {
		console.log(err.message);
		res.send([]);
	}
});
app.get("/", (req, res) => {
	res.send("Hello Jeremy Here! want to have a talk contact us!!!!!");
});

app.post("/subscribe", (req, res) => {
	try {
		var API_USER_ID = "1c980e8ed2e2ed9168b515b4a68f93a8";
		var API_SECRET = "a4583b3ab03f5107ceae1bca871e4380";
		var TOKEN_STORAGE = "./tmp/";

		sendpulse.init(
			API_USER_ID,
			API_SECRET,
			TOKEN_STORAGE,
			function (token) {
				var responseLogger = function (data) {
					console.log(data);
				};
				sendpulse.addEmails(responseLogger, 114508, [req.body.email]);
			}
		);
		res.send("Success");
	} catch (err) {
		res.send(err.message);
		console.log(err.message);
	}
});

console.log("I am listening sir");
const PORT = process.env.PORT;
// console.log(process.env.db_passwd);
app.listen(PORT || 3000);
