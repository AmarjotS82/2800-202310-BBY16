Project Name: PantryPal

2. Project Description 
Our team, BBY-16, is developing PantryPal, a recipe generator app designed to help home cooks reduce food waste and save money by suggesting new recipes based on the ingredients they have on hand, using a combination of datasets and chat GPT API for a personalized experience.

3. Technologies used 
We used CSS, EJS, and JavaScript for the front end. And node js for the backend, enabling us to handle complex logic and  gpt 3.5 API. We used Kaggle datasets. MongoDB was chosen as our database.

4. File directory
```
│   .env
│   .gitignore
│   databaseConnection.js
│   index.js
│   package-lock.json
│   package.json
│   Procfile
│   README.md
│   utils.js
│
├───public
│   ├───css
│   │       404.css
│   │       changePassword.css
│   │       filters.css
│   │       lists.css
│   │       login.css
│   │       members.css
│   │       navbar.css
│   │       nutrition.css
│   │       profile.css
│   │       profilePref.css
│   │       savedRecipe.css
│   │       searchRecipe.css
│   │       signup.css
│   │       style.css
│   │       todo.css
│   │
│   ├───img
│   │   │   404page.png
│   │   │   404page2.png
│   │   │   logo-no-background.png
│   │   │
│   │   └───recipes
│   │           apples-and-oranges-spiked-cider.jpg
│   │           baigan-chokha-trinidadian-broiled-grilled-mashed-eggplant.jpg
│   │           braised-chicken-legs-with-grapes-and-fennel.jpg
│   │           burst-cherry-tomato-pasta.jpg
│   │           buttered-tomatoes-with-ginger.jpg
│   │           butternut-squash-apple-soup-365210.jpg
│   │           caesar-salad-roast-chicken.jpg
│   │           caramelized-onions-vivian-howard.jpg
│   │           caramelized-plantain-parfait.jpg
│   │           charred-peach-panzanella-pickled-pepper-vinaigrette.jpg
│   │           chhena-poda-paneer-cheesecake.jpg
│   │           chicken-and-potato-gratin-brown-butter-cream.jpg
│   │           chicken-and-rice-with-leeks-and-salsa-verde.jpg
│   │           chicken-mango-cobb-salad.jpg
│   │           chicken-thighs-with-tomatoes-and-feta.jpg
│   │           chocolate-zucchini-cake-907.jpg
│   │           coconut-creamed-corn-and-grains.jpg
│   │           coconut-rice-leela-punyaratabandhu.jpg
│   │           corn-and-chickpea-bowls-with-miso-tahini.jpg
│   │           creamy-mashed-potatoes.jpg
│   │           creole-cream-cheese.jpg
│   │           creole-cream-cheesecake-with-caramel-apple-topping.jpg
│   │           crispy-salt-and-pepper-potatoes-dan-kluger.jpg
│   │           dads-trinidadian-curried-chicken.jpg
│   │           dakgangjeong-korean-sweet-crunchy-fried-chicken-maangchi.jpg
│   │           dashi-hooni-kim.jpg
│   │           deviled-eggs-106562.jpg
│   │           doenjang-jjigae-fermented-soybean-stew.jpg
│   │           drunk-apricot-shito-ghanaian-hot-pepper-sauce.jpg
│   │           easy-yogurt-and-spice-roasted-salmon-sabrina-ghayour.jpg
│   │           enfrijoladas.jpg
│   │           farmers-market-farro-bowls-with-tofu.jpg
│   │           fish-tacos-al-pastor.jpg
│   │           fresh-fruit-berry-tart-with-almond-press-in-crust.jpg
│   │           fresh-homemade-pita-alon-shaya.jpg
│   │           fried-onions-topping.jpg
│   │           frozen-avocado-cake-nadine-levy-redzepi.jpg
│   │           ghanian-snapper-with-baked-yam-chips.jpg
│   │           ginger-and-tamarind-refresher-nik-sharma.jpg
│   │           gorditas-con-camarones.jpg
│   │           homemade-paneer-recipe.jpg
│   │           hot-pimento-cheese-dip-polina-chesnakova.jpg
│   │           iced-cafe-de-olla.jpg
│   │           instant-pot-lamb-haleem.jpg
│   │           italian-sausage-and-bread-stuffing-240559.jpg
│   │           kale-and-pumpkin-falafels-with-pickled-carrot-slaw.jpg
│   │           kimchi-toast.jpg
│   │           mango-curry-joe-thottungal.jpg
│   │           maple-chile-roasted-pumpkin-with-quinoa-tabouli.jpg
│   │           maple-roasted-acorn-squash-ina-garten.jpg
│   │           maple-soy-barbecue-grilled-chicken.jpg
│   │           melted-broccoli-pasta-sheela-prakash.jpg
│   │           miso-butter-roast-chicken-acorn-squash-panzanella.jpg
│   │           miso-squash-ramen-hetty-mckinnon.jpg
│   │           newtons-law-apple-bourbon-cocktail.jpg
│   │           nut-butter-granola-bars.jpg
│   │           old-fashioned-scalloped-potatoes-10270.jpg
│   │           pan-seared-salt-and-pepper-fish.jpg
│   │           paneer-with-burst-cherry-tomato-sauce.jpg
│   │           paratha-roti-ramin-ganeshram.jpg
│   │           peach-and-sesame-crumble.jpg
│   │           peanut-butter-brookies-edd-kimber.jpg
│   │           pear-and-hazelnut-frangipane-tart-105747.jpg
│   │           pelau-234498.jpg
│   │           platanos-horneados-con-crema-y-queso-baked-banana.jpg
│   │           pork-chops-and-padron-chiles-en-escabeche.jpg
│   │           pork-meatballs-and-cucumber-salad.jpg
│   │           pumpkin-dutch-baby-recipe.jpg
│   │           remember-the-alimony-cocktail.jpg
│   │           roasted-beets-with-crispy-sunchokes-and-pickled-orange-ginger-puree.jpg
│   │           salmon-burgers-with-ginger-and-pickled-cucumbers.jpg
│   │           salted-peanut-butter-jelly-pbj-ice-cream-pie.jpg
│   │           sesame-scallion-chicken-salad.jpg
│   │           shirred-eggs-with-spinach-vivian-howard.jpg
│   │           shrimp-creole-14653.jpg
│   │           sour-cream-and-onion-potato-salad.jpg
│   │           spiced-lamb-and-dill-yogurt-pasta.jpg
│   │           spiced-lentil-and-caramelized-onion-baked-eggs.jpg
│   │           spicy-coconut-pumpkin-soup.jpg
│   │           spicy-pork-belly-sliders-jeyuk-bokkeum-hooni-kim.jpg
│   │           spiral-ham-in-the-slow-cooker-guarnaschelli.jpg
│   │           stone-fruit-custard-tart.jpg
│   │           stuffed-eggplants-and-zucchini-tomato-sauce-falastin.jpg
│   │           sumac-and-saffron-refresher-nik-sharma.jpg
│   │           summer-bean-soup-with-tomato-brown-butter-cortney-burns.jpg
│   │           sweet-corn-frittata-with-cherry-tomato-compote.jpg
│   │           swiss-chard-pasta-with-toasted-hazelnuts-and-parmesan.jpg
│   │           tacos-de-gobernador-shrimp-poblano-and-cheese.jpg
│   │           tamale-pie-with-fresh-tomato-and-corn.jpg
│   │           thai-grilled-chicken.jpg
│   │           thanksgiving-mac-and-cheese-erick-williams.jpg
│   │           tomato-and-roasted-garlic-pie.jpg
│   │           tomato-brown-butter-cortney-burns.jpg
│   │           tomato-pie-sour-cream-crust.jpg
│   │           tomato-salad.jpg
│   │           trinidad-curry-powder.jpg
│   │           trinidadian-green-seasoning.jpg
│   │           turmeric-hot-toddy-claire-sprouse.jpg
│   │           veselkas-famous-borscht.jpg
│   │           warm-comfort-tequila-chamomile-toddy.jpg
│   │           zucchini-lentil-fritters-with-lemony-yogurt.jpg
│   │
│   └───js
│           calorie.js
│           filters.js
│           lists.js
│           members.js
│           navbar.js
│           profilePref.js
│           recipe.js
│           searchRecipe.js
│           signup.js
│           todo.js
│
├───scratch
│       Caffeine
│       cafGoal
│       calGoal
│       Calories
│       dietaryPreferences
│       Goal
│       ingredients
│       nutritionalInfo
│       recipe
│
└───views
    │   404.ejs
    │   answer-questions.ejs
    │   changePassword.ejs
    │   correctAnswer.ejs
    │   filters.ejs
    │   incorrectAnswer.ejs
    │   index.ejs
    │   invalid-login.ejs
    │   invalid-password.ejs
    │   invalid-signup.ejs
    │   lists.ejs
    │   login.ejs
    │   members.ejs
    │   nutrition.ejs
    │   profile.ejs
    │   profilePreferences.ejs
    │   recipes.ejs
    │   searchRecipe.ejs
    │   signup.ejs
    │   todo.ejs
    │
    └───templates
            footer.ejs
            header.ejs
            navbar.ejs
            Recipe-template.ejs
```

The test Log URL: 05b_testing_log_BBY16 - Google Sheets 

5.  Requirement for Install or run the project 
Note: The installation order does matter
Setup: 
Install visualStudio Code IDE
Install Studio 3T 
Create a mongoDb account and use this URl in studio 3T: mongodb+srv://<MONGODB_USER>:<MONGODB_PASSWORD>@<MONGODB_HOST>/?retryWrites=true&w=majority gotten from the  env file (passwords.txt)
Install node
Install node modules using “npm i” command after installing node
Include these packages in .gitignore : package-lock.json , .env, scratch

Requires to install npm I openAI, and We used chat GPT API for this project. The AI's API key is required to work on this project. Also, to use the database, accessing to the keys is required as well. Which all


6. Features:
Generate the recipe by selecting ingredients
Save the Recipe by click the bookmark icon and see recipes in saved page
Add calories or carbohydrates intakes and goals 
View information about yourself in the profile page
Create a grocery list in the grocery list page
Search for recipes in the search page
Add dietary restrictions if you have any to generate recipe based on ur diet
	
7.No licences,credits or refrences used
8. How did you use AI? Tell us exactly what AI services and products you used and how you used them. Be very specific:
During this project, we used AI in a variety of places to help us troubleshoot and fix our bugs. In addition, We built our main feature with the use of Chat GPT 3.5 turbo API to generate recipes, using ingredients selected by the user. In this way, each user gets a variety of personalized recipes based on the selected ingredient.
We construct the prompts based on the user’s selected inputs, and we then feed it into ChatGPT with a mix of our prompt and users ingredient list, which gives us an output. In our prompt, we ask ChatGPT also to give us nutritional information of the recipe generated. We made sure that the AI formats the output in the specific way we wanted it by using specific prompts such as “ Put the recipe name in a h2 element."
, " Put the ingredient and instruction in h3 elements.", "  provide the fat, protein, calorie and carbohydrates content after the recipe. ", " Surround the recipe name, the recipe name and nutritional info in a div element.",  " Do not give me any HTML head or body tags.", " Do not include any images. Do not include any comments in the code." in this way we manipulate the outcomes to receive the one that suits our app.  We did not use AI to create a dataset for us. We cleared our dataset manually

9. Contact Information
Parin: pravanbakhsh@my.bcit.ca
Arcie: alao10@my.bcit.ca
Amarjot: asangha52@my.bcit.ca
Daniel: dlau67@my.bcit.ca

