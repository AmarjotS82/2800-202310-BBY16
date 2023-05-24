var isEmpty = document.getElementById('generated-recipe').innerHTML.trim() === "";
console.log(isEmpty);
if(isEmpty) {
    document.getElementById("save-button").style.display = "none";
}
