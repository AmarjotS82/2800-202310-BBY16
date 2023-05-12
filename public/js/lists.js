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

// Get all the buttons with the class 'custom-button'
const buttons = document.querySelectorAll('.custom-button');

// Add a click event listener to each button
buttons.forEach(button => {
  button.addEventListener('click', function() {
    // Toggle the 'btn-dark' and 'btn-light' classes on the clicked button
    this.classList.toggle('btn-secondary');
    this.classList.toggle('btn-light');
  });
});

var searchInput = document.getElementById("search-input");
searchInput.addEventListener("input", searchIngredients);

