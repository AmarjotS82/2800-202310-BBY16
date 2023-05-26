var isEmpty = document.getElementById('generated-recipe').innerHTML.trim() === "";
console.log(isEmpty);
if(isEmpty) {
    document.getElementById("save-button").style.display = "none";
}


var iconVisible = document.querySelector('.bi-bookmark-star');
var iconHidden = document.querySelector('.bi-bookmark-star-fill');

iconVisible.addEventListener('click', function () {
  iconHidden.style.display = 'inline-block';
});

var saveButton = document.querySelector('.save');
var recipe = document.getElementById('recipe-container');
var isValid = recipe.getAttribute('isValid');
if(isValid == 'true') {
  swal({
    title: "Recipe saved!"
  })
}
