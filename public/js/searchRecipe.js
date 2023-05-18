$(document).ready(async function() {



      var searchBar = document.getElementById("searchBar");

      searchBar.addEventListener("input", function(){
        
        let input = searchBar.value;
        console.log("input: " + input);
        
       if(input != null){
        var cardTitles = $(".card");
        cardTitles.each(function() {
          var title = $(this).text();
          if (title.includes(input)) {
            // The search value is found in a heading
            console.log("title :"+ title);
            
          }else{
            $(this).remove();
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
      </ul> `);
      console.log(info.recipe[info.index].Instructions);
      $('.modal-footer').html(`
      <h3 style="color:black; margin-right:auto">Instructions: </h3>
      <ol> 
      ${info.recipe[info.index].Instructions}
      </ol>`);
      
    })

});


// for(let i = 0; i < recipe.length; i++) {
//   let ingredient = recipe[i];
//   for(let y = 0; y < ingredient.length; y++){
//     let letter = ingredient.charAt(y);
//     if(letter == '\',') {
//       ingredient.replace(ingredient.charAt(y), "</li>")
//     } else if(letter == '\'],'){

//     }else {
//       ingredient.replace('\'', "<li>");
//     }
//   }
// }