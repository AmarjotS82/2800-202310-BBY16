document.addEventListener('DOMContentLoaded', function() {
    const recipe = getRecipe();
    console.log(recipe);
  });
  
  function getRecipe() {
    let recipe;
  
    recipe = '<%= recipe %>'; // Use the correct syntax based on your template engine
  
    if (recipe === null || recipe === '') {
      recipe = '';
    } else {
      localStorage.setItem("recipe", recipe);
    }
  
    return recipe;
  }