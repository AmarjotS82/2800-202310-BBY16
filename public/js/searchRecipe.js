$(document).ready( function() {



      var searchBar = document.getElementById("searchBar");

      searchBar.addEventListener("input", function(){
        let input = searchBar.value.toLowerCase();

        console.log("input: " + input);
        console.log("input: " + input.length);
        if (input.length == 0) {
          var cardTitles = $(".card");

          cardTitles.each(function() {
            //got show method from gpt
            $(this).show();
        });
      } else {
        
        var cardTitles = $(".card");

        

        cardTitles.each(function() {
          var title = $(this).text().toLowerCase();
          
          //console.log("match: " + title.includes(input.toLowerCase()));
          
          if (title.includes(input.toLowerCase())) {
            console.log("match")
            $(this).show();
          }else{
            console.log("no match")
            //got hide method from gpt
            $(this).hide();
          }
        });
        
       }
  

      });      

    $("body").on("click","#details", async function() {
      let info = JSON.parse($(this).attr("value"));
      
      console.log(info.recipe);
      console.log(info.index);
      $('.modal-header').html(`<h5 class="modal-title">${info.recipe[info.index].Title}</h5> 
      <button type="button" class="close btn btn-danger" data-bs-dismiss="modal" aria-label="Close">
      <span aria-hidden="true">X</span>
    </button>
    `);
    console.log(info.recipe[info.index].Title);

      $('.modal-body').html(`<img src="/img/recipes/${info.recipe[info.index].Image_Name}.jpg">
      <h3 style="color:black">Ingredients: </h3>
      <ul>
      ${info.recipe[info.index].Ingredients}
      </ul> 
      <a href="/loggedin/todo" type="button" class="btn btn-primary" id="addList">Add to list</a>`);
      console.log(info.recipe[info.index].Instructions);
      $('.modal-footer').html(`
      <h3 style="color:black; margin-right:auto">Instructions: </h3>
      <ol> 
      ${info.recipe[info.index].Instructions}
      </ol>`);
      $(`#addList`).on("click", function(){
        console.log("button clicked")
        let ingredients = info.recipe[info.index].Ingredients;
        console.log("ingred: " + ingredients);
        for(let y = 0; y < ingredients.length; y++){
          	let letter = ingredients.charAt(y) + ingredients.charAt(y + 1) + ingredients.charAt(y + 2)+ ingredients.charAt(y + 3);
          //                            <             l                            i                           >
          	if(letter == '<li>') {
          		ingredients= ingredients.replace(letter, "")
          	} else if( letter =='</li'){
              ingredients = ingredients.replace(letter, ", ")
            }	
           }
           for(let y = 0; y < ingredients.length; y++){
          	let letter = ingredients.charAt(y);
          	if(letter == '>') {
          		ingredients= ingredients.replace(letter, "")
          	}
           }
          
           console.log("ingred2: " + ingredients);
           let item ="";
           let array = JSON.parse(localStorage.getItem('todos')) || [];


           for(let i =0; i<ingredients.length; i++){
            if(ingredients[i] != ","){
            item += ingredients[i];
           } else{
            array.push(item);
            localStorage.setItem('todos', JSON.stringify(array));
            item="";
           }
          }
      })
    })
   
});