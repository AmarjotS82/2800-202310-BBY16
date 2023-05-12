/* This line of code was originally from OpenAI's ChatGPT but has been modified for our needs */
function searchIngredients() {
    // Get the search query entered by the user
    var searchQuery = document.getElementById("search-input").value.toLowerCase();
    console.log(searchQuery);
    // Get the list of ingredients to search through
    const ingredientList = document.querySelectorAll("#ingredient-List");
    console.log(ingredientList);

    // Loop through each ingredient in the list
    for (var i = 0; i < ingredientList.length; i++) {
        var ingredient = ingredientList[i];
        console.log(ingredient);

        // Check if the ingredient name contains the search query
        if (ingredient.innerText.toLowerCase().startsWith(searchQuery)) {
            // If the ingredient matches the search query, show it
            ingredient.style.display = "block";
        } else {
            // If the ingredient does not match the search query, hide it
            ingredient.style.display = "none";
        }
    }
}
var searchInput = document.getElementById("search-input");
searchInput.addEventListener("input", searchIngredients);

