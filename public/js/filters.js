
// Get all the buttons with the class 'dietary-button'
const buttons = document.querySelectorAll('.dietary-button');
// Add a click event listener to each button
buttons.forEach(button => {
    button.addEventListener('click', function() {
      // Toggle the 'btn-light' and 'btn-secondary' classes on the clicked button
      this.classList.toggle('btn-light');
      this.classList.toggle('btn-secondary');
    });
  });

  const button = document.querySelectorAll('.dietary-button');
  const colors = ['#85603F', '#EADDCA'];
  
  button.forEach(function(button) {
    let index = 0;
  
    button.addEventListener('click', function() {
      button.style.backgroundColor = colors[index];
      button.style.color = 'black';

      index = index >= colors.length - 1 ? 0 : index + 1;
    });
  });

  document.addEventListener('DOMContentLoaded', function() {
    //When DOM is loaded, remove any previously stored dietary preferences
    localStorage.removeItem('dietaryPreferences');
    getDietaryPreferences();
  });
  
  // Add event listeners to the buttons
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
    // Add or remove the preference from the array based on its presence
    const index = dietaryPreferences.indexOf(preference);
    if (index !== -1) {
      dietaryPreferences.splice(index, 1);
      button.classList.remove('active');
    } else {
      dietaryPreferences.push(preference);
      button.classList.add('active');
    }
    //Set new dietary preferences in local storage
    localStorage.setItem("dietaryPreferences", JSON.stringify(dietaryPreferences));
    console.log(dietaryPreferences);
  }
  
  // Function to update the dietary preferences before form submission
  function updateDietaryPreferences() {
    dietaryPreferences = getDietaryPreferences();
    //Update hidden input field with dietary preferences before form submission
    document.getElementById('dietaryPreferencesInput').value = JSON.stringify(dietaryPreferences);
  
  }
  
  // Function to retrieve the dietary preferences from local storage
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
  