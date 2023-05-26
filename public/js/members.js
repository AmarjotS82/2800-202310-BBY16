//this checks if generated recipe is empty
var isEmpty = document.getElementById('generated-recipe').innerHTML.trim() === "";
console.log(isEmpty);

//if empty then save button is styled to none
if(isEmpty) {
    document.getElementById("save-button").style.display = "none";
}


var iconVisible = document.querySelector('.bi-bookmark-star');
var iconHidden = document.querySelector('.bi-bookmark-star-fill');

//this changes the style of icon based on click
iconVisible.addEventListener('click', function () {
  iconHidden.style.display = 'inline-block';
});

//this checks if param is a true which means user saved a recipe and an alert shows up
var saveButton = document.querySelector('.save');
var recipe = document.getElementById('recipe-container');
var isValid = recipe.getAttribute('isValid');
if(isValid == 'true') {
  swal({
    title: "Recipe saved!"
  })
}
