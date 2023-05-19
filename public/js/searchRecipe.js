$(document).ready(async function() {
  // const arr = [];
  // let i =0;
  // var cardTitles = $(".card");

  //       cardTitles.each(function() {
  //         var title = $(this).text().toLowerCase();
  //         arr[i] = $(this).html();
  //         i++;
  // });
  // for(let k=0 ;k<arr.length;k++){
  //   console.log("arr: " + arr[i]);
  // }


      var searchBar = document.getElementById("searchBar");

      searchBar.addEventListener("input", function(){
        let input = searchBar.value.toLowerCase();
        // searchBar.addEventListener('keydown', function(event) {
        //   const key = event.key;
        //   if (key === "Backspace" || key === "Delete") {
        //       console.log("backspace pressed");
        //       in
        //   }
        // });
        //let input = searchBar.value;
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
            // The search value is found in a heading
             // console.log("title :"+ title);
            // $(this).append('${arr}')
            // for (let k = 0; k < arr.length; k++) {
            //   if(arr[k].toLowerCase().includes(title))
            //   $("body").append(`<div class="card" style="width: 18rem;">` + arr[k] + "</div>");
            // }
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
      </ul> `);
      console.log(info.recipe[info.index].Instructions);
      $('.modal-footer').html(`
      <h3 style="color:black; margin-right:auto">Instructions: </h3>
      <ol> 
      ${info.recipe[info.index].Instructions}
      </ol>`);
      
    })

});