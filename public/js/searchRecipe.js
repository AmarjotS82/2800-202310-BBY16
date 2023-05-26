$(document).ready( function() {

      var searchBar = document.getElementById("searchBar");

      //If an input is detected update the cards that are shown if the recipe name includes the letter(s) input otherwise hide the card
      searchBar.addEventListener("input", function(){
        let input = searchBar.value.toLowerCase();
        //This is for a blank search bar where it will show all recipes
        if (input.length == 0) {
          var cardTitles = $(".card");

          cardTitles.each(function() {
            $(this).show();
        });
      } else {
        var cardTitles = $(".card");
        //checks each card to see if it matches need to turn both input and name to lowercase because comparing is case sensitive
        cardTitles.each(function() {
          var title = $(this).text().toLowerCase();
          
          if (title.includes(input.toLowerCase())) {
            $(this).show();
          }else{
            $(this).hide();
          }
        });
        
       }
  

      });      

      //Creates a modal if the user clicks the details button on a card
    $("body").on("click","#details", async function() {
      //getting the recipe array and the index of the recipe in JSON clicked through the value attribute in the detials button
      let info = JSON.parse($(this).attr("value"));
      //storing the recipe field that contains the recipe information and index of that recipe in the array
      let recipeList = info.recipe;
      let index = info.index;
      //
      $('.modal-header').html(`<h5 class="modal-title">${recipeList[index].Title}</h5> 
      <button type="button" class="close btn btn-danger" data-bs-dismiss="modal" aria-label="Close">
      <span aria-hidden="true">X</span>
    </button>
    `);

      $('.modal-body').html(`<img src="/img/recipes/${recipeList[index].Image_Name}.jpg">
      <h3 style="color:black">Ingredients: </h3>
      <ul>
      ${recipeList[index].Ingredients}
      </ul> 
      <a href="/loggedin/todo" type="button" class="btn btn-primary" id="addList">Add to list</a>`);

      $('.modal-footer').html(`
      <h3 style="color:black; margin-right:auto">Instructions: </h3>
      <ol> 
      ${recipeList[index].Instructions}
      </ol>`);

      //When user clicks on the add Ingredients to lsit button it foramts the information to be read in todo.js 
      $(`#addList`).on("click", function(){
        let ingredients =info.recipe[info.index].Ingredients;

        //replace commas with spaces by iterating though the ingredients by character and checking if that character is a comma
        //needed because when adding to array causes bugs where words are split in half because the code reads a new index
        for(let y = 0; y < ingredients.length; y++){
          let letter = ingredients.charAt(y);

          if(letter == ',') {
            ingredients= ingredients.replace(letter, " ")
         }
        }

        //replace list tags with empty strings or commas by iterating though the ingredients by character and checking if the next 4 characters are a list tag
        //needed otherwise lsit tags are shown when displaying ingredients in grocery list
        for(let y = 0; y < ingredients.length; y++){
          	let letter = ingredients.charAt(y) + ingredients.charAt(y + 1) + ingredients.charAt(y + 2)+ ingredients.charAt(y + 3);

          	if(letter == '<li>') {
          		ingredients= ingredients.replace(letter, "")
          	} else if( letter =='</li'){
              ingredients = ingredients.replace(letter, ", ")
            }	
           }
           for(let y = 0; y < ingredients.length; y++){
          	let letter = ingredients.charAt(y);
        //replace end of lsit tag that doesnt get caught with empty string
          	if(letter == '>') {
          		ingredients= ingredients.replace(letter, "")
          	}
           }
          
           //get existing items in te grocery list by parsing and create an empty string to add new items on to
           let item ="";
           let existingItems = JSON.parse(localStorage.getItem('todos')) || [];

           //iterate through the ingredients and while you don't encounter a comma keep on adding to the string.
           //if a comma is read then put that item to the array of already existing shopping list,
           //that way each ingredient is added on a seperate index and not all in the same index. 
           //Then add to localstorage and reset the string by making it empty for the next ingredient
           for(let i =0; i<ingredients.length; i++){
            if(ingredients[i] != ","){
            item += ingredients[i];
           } else{
            existingItems.push(item);
            localStorage.setItem('todos', JSON.stringify(existingItems));
            item="";
           }
          }
      })
    })
   
});