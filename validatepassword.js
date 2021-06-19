const validPassword=async(password)=>{
    try{
		if(password.length>6 && /[0-9]/.test(password) && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password)){
			return true;
		}
		else{
			return false
		}

	}
	catch(err){
		console.error(err.message);
        res.send('error_validPassword');
	}

}
//simply for testing
const test = async () => {
	
	valid = await validPassword("P@radeopsh2203");
	if (valid) {
		console.log("cheers");
	} else {
		console.log("password not satisfy conditions");
	}

};