//BBY-16
require("./utils.js");

const express = require('express');

const session = require('express-session');

const MongoStore = require('connect-mongo');

const axios = require('axios');

//Crates a localstroage to sue for te counters 
var LocalStorage = require('node-localstorage').LocalStorage;
//A folder that holds the data
localStorage = new LocalStorage('./scratch');

require('dotenv').config();

const bcrypt = require('bcrypt');

var mongo = require('mongodb');

const Joi = require("joi");

const { Configuration, OpenAIApi } = require("openai");

const app = express();

const readline = require('readline');

const port = process.env.PORT || 3020;

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;

const openai_api_key = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
	apiKey: openai_api_key,
});

const openai = new OpenAIApi(configuration);

const questions = [
	"What is the name of your hometown?",
	"What did you want to be growing up?",
	"What is your first car?",
	"What was your first pet's name?",
	"Who is your favourite author?"
];

const generateRecipe = async () => {
	const prompt = constructPrompt();

	const response = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [{ role: "user", content: prompt }],
		max_tokens: 2048,
		temperature: 1,
	});

	console.log(prompt);
	console.log(response["data"]["choices"][0]["message"]["content"]);
	recipe = response["data"]["choices"][0]["message"]["content"];
	return recipe;
};

function constructPrompt() {
	// Construct the prompt based on the ingredients and dietary preferences
	let prompt = "Generate a recipe using ";

	// Add the list of ingredients to the prompt
	const ingredientList = getLocalIngredients().join(", ");
	prompt += ingredientList;

	// Add dietary preferences to the prompt if provided
	const preferencesList = getLocalDietaryPreferences().join(", ");

	if(preferencesList.length > 0) {
	prompt += ", considering these dietary preferences: ";
	prompt += preferencesList;
	}

	prompt += ". Please format the recipe to be displayed in a HTML div element."
	prompt += " Please do not include any images. "
	//prompt += " Also, please list each item used in the recipe along with amounts used as a array of JSON objects at the end of the recipe."

	return prompt;
}

// Example usage
localStorage.setItem('ingredients', '[]');
localStorage.setItem('recipe', '[]');
localStorage.setItem('dietaryPreferences', '[]');

const saltRounds = 12; //use for encryption

const expireTime = 1 * 60 * 60 * 1000; //expiration time

var { database } = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');

const savedRecipeCollection = database.db(mongodb_database).collection('saved_recipes');

const testCollection = database.db(mongodb_database).collection('ingredient');

const recipeCollection = database.db(mongodb_database).collection('recipes');

//---------------For generating recipe on console input-----------------


const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// Define the method to run when the specific input is received
function processInput() {
	generateRecipe();
}

// Ask for user input
rl.question('Enter 8 into console to generate recipe: ', (answer) => {
	if (answer === '8') {
		processInput();
	} else {
		console.log('Input does not match the specific condition.');
	}

	rl.close();
});


//-------------------------------------------------------------------------



app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));

var mongoStore = MongoStore.create({
	mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
	crypto: {
		secret: mongodb_session_secret
	}
});

app.use(session({
	secret: node_session_secret,
	store: mongoStore,
	saveUninitialized: false,
	resave: true
}
));

function getLocalIngredients() {
	const storedIngredients = localStorage.getItem('ingredients');
	return JSON.parse(storedIngredients) || [];
}

function getLocalDietaryPreferences() {
	const storedPreferences = localStorage.getItem('dietaryPreferences');
	return JSON.parse(storedPreferences) || [];
}
/** Use later for valid session */
function isValidSession(req) {
	if (req.session.authenticated) {
		return true;
	}
	return false;
}

function sessionValidation(req, res, next) {
	if (isValidSession(req)) {
		next();
	}
	else {
		res.redirect('/login');
	}
}

app.get('/', (req, res) => { //good
	res.render("index");
});

app.get('/signup', (req, res) => {
	res.render('signup');
});

app.get('/invalid-signup', (req, res) => {
	res.render('invalid-signup');
});

async function doesEmailExist(email) {
	const result = await userCollection.find({ email: email }).project({ email: 1, _id: 1, username: 1 }).toArray();

	if (result.length == 0) {
		return false;
	} else {
		return true;
	}
}

async function doesUsernameExist(username) {
	const result = await userCollection.find({ username: username }).project({ email: 1, _id: 1, username: 1 }).toArray();

	if (result.length == 0) {
		return false;
	} else {
		return true;
	}
}

app.post('/forgetPassword', async (req, res) => {
	var email = req.body.email;

	const schema = Joi.string().email().required();

	const validationResult = schema.validate(email);
	if (validationResult.error != null) {
		res.render('changePassword', { message: "Invalid Email" });
		return;
	}

	if (await doesEmailExist(email)) {

		const result = await userCollection.find({ email: email }).project({ email: 1, question: 1 }).toArray();

		var userQuestion = questions[result[0].question];
		//where they answer the question
		//use ejs to get the question they have
		res.render('answer-questions', { question: userQuestion, email: result[0].email });

	} else {
		res.render("changePassword", {message: "Email doesn't exist!"});
		return;

	}


});

app.get('/answer-questions', (req, res) => {
	res.render('answer-questions');
});

app.post('/submitAnswer/:id', async (req, res) => {
	var answer = req.body.answer;
	var email = req.params.id;

	const result = await userCollection.find({ email: email }).project({ email: 1, username: 1, answer: 1 }).toArray();

	if (await bcrypt.compare(answer, result[0].answer)) {
		//where they will change password
		res.render('correctAnswer', { username: result[0].username, email: email });
		return;
	} else {
		res.render('incorrectAnswer');
		return;
	}
});

app.post('/newpassword/:id', async (req, res) => {
	var password = req.body.password;
	var email = req.params.id;
	const schema = Joi.string().max(20).required();

	const validationResult = schema.validate(password);
	if (validationResult.error != null) {
		res.send("INVALID PASSWORD");
		return;
	}

	var hashedPassword = await bcrypt.hash(password, saltRounds);

	await userCollection.updateOne({ email: email }, { $set: { password: hashedPassword } });

	res.render('login');
});

app.post('/submitUser', async (req, res) => { //good
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	//forget password stuff
	var question = req.body.question;
	var answer = req.body.answer;

	const schema = Joi.object(
		{
			username: Joi.string().alphanum().max(20).required(),
			email: Joi.string().email().required(),
			password: Joi.string().max(20).required(),
			answer: Joi.string().max(20).required(),
		});

	//this confirms everything is valid
	const validationResult = schema.validate({ username, email, password, answer });
	if (validationResult.error != null) {
		var message = validationResult.error.details[0].message;
		res.render("invalid-signup", { message: message });
		return;
	}

	if (question == 0) {
		var message = "You must select a question.";
		res.render("invalid-signup", { message: message });

		return;
	}

	if (await doesEmailExist(email)) {
		var message = "This email already exist!";
		res.render("invalid-signup", { message: message });
		return;
	}

	if (await doesUsernameExist(username)) {
		var message = "This username already exist!";
		res.render("invalid-signup", { message: message });
		return;
	}


	var hashedPassword = await bcrypt.hash(password, saltRounds);
	var hashedAnswer = await bcrypt.hash(answer, saltRounds);

	await userCollection.insertOne({ username: username, email: email, password: hashedPassword, answer: hashedAnswer, question: question });
	console.log("inserted user");


	req.session.authenticated = true;
	req.session.username = req.body.username;
	res.redirect("/loggedin/members");

	return;
});

app.use('/loggedin', sessionValidation);
app.get('/loggedin', (req, res) => {
	if (!req.session.authenticated) {
		res.redirect('/login');
	}
	res.render("loggedin");
});

app.post('/loggingin', async (req, res) => { //done
	var username = req.body.username;
	var password = req.body.password;

	const schema = Joi.string().max(20).required();
	const validationResult = schema.validate(username, password);
	if (validationResult.error != null) {
		console.log(validationResult.error);
		res.redirect("/login");
		return;
	}

	const result = await userCollection.find({ username: username }).project({ password: 1, _id: 1, username: 1, email: 1 }).toArray();

	if (result.length != 1) { //if user doesnt exist
		res.redirect("/login");
		return;
	}

	if (await bcrypt.compare(password, result[0].password)) {
		console.log("correct password");
		req.session.authenticated = true;
		req.session.email = result[0].email;
		console.log(req.session.email);
		req.session.username = result[0].username;
		console.log(req.session.username);
		req.session.cookie.maxAge = expireTime;

		res.redirect('/loggedin/members');
		//return;
	}
	else {
		res.redirect("/login");
		return;
	}
});


app.use(express.static(__dirname + "/public"));

app.get('/login', (req, res) => {
	res.render('login');
});

//this is where the 
app.get('/changePassword', (req, res) => {
	res.render('changePassword', { message: "" });
});

app.use(express.static(__dirname + "/public"));

//new stuff added


app.get('/loggedin/members', async (req,res) => {
	const recipe = JSON.parse(localStorage.getItem('recipe'));
	var username = req.session.username;
	const result = await userCollection.find({ username: username }).project({ username: 1}).toArray();

	res.render('members', {recipe: recipe, username: result[0].username });
})


app.post('/generateRecipe', async (req, res) => {
	try {
	  const recipe = await generateRecipe();
	  localStorage.setItem('recipe', JSON.stringify(recipe));
	  res.redirect('/loggedin/members');
	} catch (error) {
	  // Handle any errors that occur during recipe generation
	  res.status(500).send('Error generating recipe.');
	}
  });

app.post('/clearRecipe', async (req,res) => {
	localStorage.setItem('recipe', '[]');
	localStorage.setItem('ingredients', '[]');
	res.redirect('loggedin/members');
  });

  // Route handler for adding an item to the local storage
app.post('/addToList', (req, res) => {
	const newItem = req.body.item;
  
	// Retrieve the existing list from local storage
	const existingList = JSON.parse(localStorage.getItem('list')) || [];
  
	// Add the new item to the list
	existingList.push(newItem);
  
	// Store the updated list in local storage
	localStorage.setItem('list', JSON.stringify(existingList));
  
	// Send back the updated list as the response
	res.json(existingList);
  });
  
  // Route handler for removing an item from the local storage
  app.post('/removeFromList', (req, res) => {
	const itemToRemove = req.body.item;
  
	// Retrieve the existing list from local storage
	const existingList = JSON.parse(localStorage.getItem('list')) || [];
  
	// Filter out the item from the list
	const updatedList = existingList.filter((item) => item !== itemToRemove);
  
	// Store the updated list in local storage
	localStorage.setItem('list', JSON.stringify(updatedList));
  
	// Send back the updated list as the response
	res.json(updatedList);
  });

app.get('/loggedin/nutrition', async (req, res) => {

	//email to identify the user and get only their information
	var email = req.session.email

	//Stores the last time the user accesed the page by using email to find the specific user and turns it into an array
	var storedTime = await userCollection.find({email : email}).project({LastDateUsed: 1 }).toArray();
	
	//gets the value in the database from the array crated above
	var lastTime = storedTime[0].LastDateUsed;

	//Gets the current date by creating a new date object and getting the day
	// * Currently getting minutes for testing purposes
	var currTime = new Date().getMinutes();
	
	//console.log(lastTime);

	//Checks to see if the value in the array is null which happens the very first time the user accesses the page since they have no previous visits

	if(storedTime[0].LastDateUsed == null){
		//sets the last visit date to current date to be used next visit
		await userCollection.updateOne({email: email}, {$set: {LastDateUsed: currTime}});

		//Sets the calories and goals to zero since the user hasn't input anytihng yet
		await userCollection.updateOne({email: email}, {$set: {Calories: 0}});
		await userCollection.updateOne({email: email}, {$set: {CalorieGoal: 0}});
	}
	//Check if the user is logging in on a new day and reset values so they can keep track daily
	// * Currently every 2 mins for testing purposes
	if(currTime - lastTime > 1) {
		//sets the last visit date to current date to be used next visit by finding difference between last vist and current date
		await userCollection.updateOne({email: email}, {$set: {LastDateUsed: currTime}});
		//Resets the calories and goals to zero so user can add daily
		await userCollection.updateOne({email: email}, {$set: {Calories: 0}});
		await userCollection.updateOne({email: email}, {$set: {CalorieGoal: 0}});
	}else if(currTime < lastTime){
		//This is to deal with days when the differnece of last vist and current date is less than 1
		// Example: May 29 and then June 4 the first if statement wouldn't catch this case and not update values/date 
		
		//sets the last visit date to current date to be used next visit
		await userCollection.updateOne({email: email}, {$set: {LastDateUsed: currTime}});

		//Resets the calories and goals to zero so user can add daily
		await userCollection.updateOne({email: email}, {$set: {Calories: 0}});
		await userCollection.updateOne({email: email}, {$set: {CalorieGoal: 0}});

	}

	//Stores the number of calories the user has input by using email to find the specific user and turns it into an array
	let calorieCount = await userCollection.find({email : email}).project({Calories: 1 }).toArray();

	//Stores the calorie goal the user has input by using email to find the specific user and turns it into an array
	let storedcalorieGoal = await userCollection.find({email : email}).project({CalorieGoal: 1 }).toArray();
	
	//renders the Calorie counter page and passes the variables with the values for calorie intake and calorie goal
	res.render("nutrition", {
		//Calorie intake gotten from calorieCount array above 
		// .Calories - the specific column name in the databse that the value is located in
		Calories: calorieCount[0].Calories,

		//Calorie goal gotten from calorieCount array above
		//Calorie intake gotten from calorieCount array above  
		// .CalorieGoal - the specific column name in the databse that the value is located in
		calGoal: storedcalorieGoal[0].CalorieGoal
	});
});
//********************** Calorie Counter Page Ends*/

//method to put values in the database
app.post('/nutritionInfo', async (req,res) => {
	//email to idnetify user
	var email = req.session.email;
	//calorie maount value inputted by user
	var calories = req.body.calories;
	//calorie Goal value inputted by user
	 var calorieGoal = req.body.calGoal;

	 //If user gives blank input calories is zero so no change to previous value and don't allow negative numbers
	if (calories == "" || calories < 0) {
		calories = 0;
	}

	//Crate schema to validate input is a number and integer
	const schema = Joi.number().integer();
	
	//Can only fill one feild at a time so other field becomes undefined this makes it so the undefined doesn't get added
	if (calories != null) {
		//validate input using schema crated above
		const validationResult = schema.validate(calories);
		//If there is an error message redirect to same page
		if (validationResult.error != null) {
			console.log(validationResult.error);
			res.redirect("/loggedin/nutrition");
			return;
		}
		//Find exisiting value so that user can add on to the amount 
		let calCount2 = await userCollection.find({email : email}).project({Calories: 1 }).toArray();
		//Add new amount to existing amount
		calCount2[0].Calories += parseInt(calories);
		//Update database with new value
		await userCollection.updateOne({email: email}, {$set: {Calories: calCount2[0].Calories}});
	
	}

	//Can only fill one feild at a time so other field becomes undefined this makes it so the undefined doesn't get added
	if (calorieGoal != null) {
		//validate input using schema crated above
		const validationResult = schema.validate(calorieGoal);
		//If there is an error message redirect to same page
		if (validationResult.error != null) {
			console.log(validationResult.error);
			res.redirect("/loggedin/nutrition");
			return;
		}
		//Set value inputted into the database overwrites old value
		await userCollection.updateOne({email: email}, {$set: {CalorieGoal: calorieGoal}});
	}

	res.redirect("/loggedin/nutrition");


});

app.get('/filters',(req, res)  => {
	res.render("filters", { ingredients: getLocalIngredients() , preferences:getLocalDietaryPreferences()});
});

//route for list of ingredients page
app.get("/lists", async (req, res) => {
	//Find all id and names(Food field) of all contents in collection
	//Make sure capital F for food otherwise doesn't work
	const ingredientList = await testCollection.find({}).project({ _id: 1, "Food": 1 }).toArray();
	//Checking if it works
	for (var i = 0; i < ingredientList.length; i++) {
		// console.log("L: " + ingredientList[i].Food);
	}

	const chosenIngredients = getLocalIngredients();

	//Render the lists.ejs file that has the html for this apge
	res.render("lists", { list: ingredientList, ingredients: chosenIngredients });
});

app.get("/loggedin/members/profile", async (req, res) => {
	var username = req.session.username;

	const result = await userCollection.find({ username: username }).project({ username: 1, email: 1, question: 1 }).toArray();

	res.render('profile', { username: result[0].username, email: result[0].email, question: questions[result[0].question] });
});

app.post('/updateLocalIngredient/', (req, res) => {
	const foodName = req.body.foodName;
	
	const ingredients = getLocalIngredients();
	const index = ingredients.indexOf(foodName);

	if (index !== -1) {
		// If foodName is already in the ingredients array, remove it
		ingredients.splice(index, 1);
		localStorage.setItem('ingredients', JSON.stringify(ingredients));
		console.log("Removed " + foodName);
	} else {
		// If foodName is not in the ingredients array, add it
		ingredients.push(foodName);
		localStorage.setItem('ingredients', JSON.stringify(ingredients));
		console.log("Added " + foodName);
	}

	console.log(ingredients);
});

app.post('/updateDietaryPreference', async (req,res ) => {
	const newPreference = req.body.preference;
	const storedPreferences = getLocalDietaryPreferences();
	const index = storedPreferences.indexOf(newPreference);

	if (index === -1) {
		//If preference is not in dietaryPreference in localstorage, add it
	  storedPreferences.push(newPreference);
	  console.log("Added " + newPreference);
	} else {
		//If preference is in dietaryPreference in localstorage, remove it
	  storedPreferences.splice(index, 1);
	  console.log("Removed " + newPreference);
	}

	localStorage.setItem('dietaryPreferences', JSON.stringify(storedPreferences));

	console.log(storedPreferences);
})



//----------------------- For saving recipes ----------------------

async function saveRecipe( recipe, username) {
	recipeName = recipe.substring(12, recipe.indexOf("/") - 1).trim();
	recipeDetails = recipe.substring(recipe.indexOf("Ingredients:"), recipe.length);
	console.log(recipeName);
	console.log(username);

	await savedRecipeCollection.insertOne({username: username, recipeName: recipeName, recipe: recipeDetails});
}

app.post('/saveRecipe', async (req,res) => {
	if(typeof recipe !== 'undefined') {
		saveRecipe(recipe, req.session.username);
		res.redirect('/loggedin/recipes');
	} else {
		console.log("Must create recipe!");
		return;
	}
})

//------------------------------------------------------------------

//----------------------- For unsaving recipes ----------------------

app.post('/unsaveRecipe/:id', async (req,res) => {
	let recipe_id = req.params.id;

	await savedRecipeCollection.deleteOne({_id: new mongo.ObjectId(recipe_id)});
	// const result = await savedRecipeCollection.find({_id: new mongo.ObjectId(recipe_id)}).toArray();



	// console.log(result[0].recipeName)

	res.redirect("/loggedin/recipes");
})

//------------------------------------------------------------------

//----------------------- For displaying recipes ----------------------

app.get('/loggedin/recipes', async (req, res) => {
	const result = await savedRecipeCollection.find({username: req.session.username }).toArray();

	res.render('recipes', {result: result})
})


//------------------------------------------------------------------


//----------------------- For recipe modal ----------------------

app.get('/recipe/:id', async (req,res ) => {
	const recipe_id = req.params.id;
	const result = await savedRecipeCollection.find({_id: new mongo.ObjectId(recipe_id)}).toArray();

	res.send(result);
})


//------------------------------------------------------------------

// *************** searchRecipe section**************************
app.get('/loggedin/searchRecipe', async (req, res)=> {
	let recipes = await recipeCollection.find({}).project({Title: 1,Ingredients: 1,Instructions: 1, Image_Name: 1  }).toArray();
	res.render('searchRecipe',{ recipe: recipes});
})

// ------------------------------------------------------

// *************** Grocery List *******************
app.get('/loggedin/todo', (req, res)=> {
	res.render('todo');
})
//-------------------------------------------------

// ***************logout section*************************
app.post('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/');
});
// -----------------------------------------------------

// ***********404 for all page*************************
app.get("*", (req, res) => {
	res.status(404);
	res.render("404");
});

app.listen(port, () => {
	console.log("\nListening on port " + port);
});