const validPassword = (password) => {
	if (typeof password != "string") {
		throw Error("Password is not a string");
	}
	if (
		password.length > 6 &&
		/[0-9]/.test(password) &&
		/[a-z]/.test(password) &&
		/[A-Z]/.test(password) &&
		/[^A-Za-z0-9]/.test(password)
	) {
		return true;
	} else {
		return false;
	}
};
//simply for testing
const test = () => {
	valid = validPassword(1231231);
	if (valid) {
		console.log("cheers");
	} else {
		console.log("password not satisfy conditions");
	}
};
test();
