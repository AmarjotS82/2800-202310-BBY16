// Define the array to store the clicked preferences
var dietaryPreferences = [];


// Function to handle button click
function handleButtonClick(preference) {
  // Add or remove the preference from the array based on its presence
  const index = dietaryPreferences.indexOf(preference);
  if (dietaryPreferences.includes(preference)) {
    index !== -1 ? dietaryPreferences.splice(index, 1) : dietaryPreferences.push(preference);
  } else {
    dietaryPreferences.push(preference);
  }

  // Log the updated array for testing
  console.log(dietaryPreferences);
}

// Add event listeners to the buttons
document.querySelectorAll('.dietary-button').forEach(button => {
  button.addEventListener('click', function() {
    const preference = this.getAttribute('data-item');
    handleButtonClick(preference);
  });
});