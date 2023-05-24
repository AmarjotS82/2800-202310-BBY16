document.addEventListener('DOMContentLoaded', function() {
  localStorage.removeItem('dietaryPreferences');
  getDietaryPreferences();
});

// Add event listeners to the buttons
document.querySelectorAll('.dietary-button').forEach(button => {
  button.addEventListener('click', function() {
    let preference = this.getAttribute('data-item');
    handleButtonClick(button, preference);
  });
});

document.querySelector('button[type="submit"]').addEventListener('click', updateDietaryPreferences);

function handleButtonClick(button, preference) {
  // Retrieve the current dietary preferences from local storage
  dietaryPreferences = getDietaryPreferences();
  // Add or remove the preference from the array based on its presence
  const index = dietaryPreferences.indexOf(preference);
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
  document.getElementById('dietaryPreferencesInput').value = JSON.stringify(dietaryPreferences);

}

// Function to retrieve the dietary preferences from local storage
function getDietaryPreferences() {
  let dietaryPreferences;
  console.log(localStorage.getItem("dietaryPreferences"));
  if(localStorage.getItem("dietaryPreferences") === null){
        //if null initilize the array to empty
        dietaryPreferences = [];
    }else{
        //Retrieves the stored todos from the local storage
        dietaryPreferences = JSON.parse(localStorage.getItem("dietaryPreferences")); 
    }
    return dietaryPreferences;
}

