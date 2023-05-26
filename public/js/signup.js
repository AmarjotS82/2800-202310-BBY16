document.addEventListener('DOMContentLoaded', function() {
  //When DOM is loaded, remove any previously stored dietary preferences
  localStorage.removeItem('dietaryPreferences');
  getDietaryPreferences();
});

// Add event listeners to dietary preference buttons 
document.querySelectorAll('.dietary-button').forEach(button => {
  button.addEventListener('click', function() {
    //Handle click event on a dietary preference
    let preference = this.getAttribute('data-item');
    handleButtonClick(button, preference);
  });
});

document.querySelector('button[type="submit"]').addEventListener('click', updateDietaryPreferences);

function handleButtonClick(button, preference) {
  // Retrieve the current dietary preferences from local storage
  dietaryPreferences = getDietaryPreferences();
  const index = dietaryPreferences.indexOf(preference);
  // Add or remove the preference from the array based on its presence
  if (index !== -1) {
    dietaryPreferences.splice(index, 1);
    button.classList.remove('active');
  } else {
    dietaryPreferences.push(preference);
    button.classList.add('active');
  }
  localStorage.setItem("dietaryPreferences", JSON.stringify(dietaryPreferences));
  console.log(dietaryPreferences);
}

// Function to update the dietary preferences before form submission
function updateDietaryPreferences() {
  dietaryPreferences = getDietaryPreferences();
  //Update hidden input field with dietary preferences before form submission
  document.getElementById('dietaryPreferencesInput').value = JSON.stringify(dietaryPreferences);

}

// Function to retrieve the dietary preferences list from local storage
function getDietaryPreferences() {
  let dietaryPreferences;
  console.log(localStorage.getItem("dietaryPreferences"));
  if(localStorage.getItem("dietaryPreferences") === null){
        //Initialize empty array if no preferences are currently stored
        dietaryPreferences = [];
    }else{
        //Retrieves the stored dietary preferences from the local storage and parse
        dietaryPreferences = JSON.parse(localStorage.getItem("dietaryPreferences")); 
    }
    return dietaryPreferences;
}

