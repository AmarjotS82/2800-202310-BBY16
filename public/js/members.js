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

// saveRecipeForm.addEventListener('click', function () {
//   swal({
//     title: "Recipe saved!"
//   }).then(function() {
//     window.location.href = "http://localhost:3020/loggedin/members";
//   });
// });
var recipe = document.getElementById('recipe-container');
var isValid = recipe.getAttribute('isValid');
if(isValid == 'true') {
  swal({
    title: "Recipe saved!"
  })
}
