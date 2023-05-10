require("./utils.js");


const express = require('express');

const session = require('express-session');

const MongoStore = require('connect-mongo');

require('dotenv').config();

const bcrypt = require('bcrypt');

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

const generateRecipe = async () => {
	const prompt = constructPrompt(ingredients, dietaryPreferences);

	const response = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [{ role: "user", content: prompt}],
		max_tokens: 2048,
		temperature: 1,
	});

	console.log(prompt);
	console.log(response["data"]["choices"][0]["message"]["content"]);
};

function constructPrompt(ingredients, dietaryPreferences) {
	// Construct the prompt based on the ingredients and dietary preferences
	let prompt = "Generate a recipe using ";

	// Add the list of ingredients to the prompt
	const ingredientList = ingredients.join(", ");
	prompt += ingredientList;

	// Add dietary preferences to the prompt if provided
	if (dietaryPreferences) {
		prompt += ", considering these dietary preferences: ";
		prompt += dietaryPreferences;
	}

	prompt += " Also, please list each item used in the recipe along with amounts used as a array of JSON objects at the end of the recipe."

	return prompt;
}

// Example usage
const ingredients = ["tofu", "broccoli", "soy sauce", "rice"];
const dietaryPreferences = "vegan";

const saltRounds = 12; //use for encryption

const expireTime = 1 * 60 * 60 * 1000; //expiration time

var { database } = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');

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

/** Use later for valid session */
// function isValidSession(req) {
//     if (req.session.authenticated) {
//         return true;
//     }
//     return false;
// }

app.get('/', (req, res) => { //good
	res.render("index");
});

app.use(express.static(__dirname + "/public"));


app.get("*", (req, res) => {
	res.status(404);
	res.render("404");
});

app.listen(port, () => {
	console.log("Listening on port " + port);
});