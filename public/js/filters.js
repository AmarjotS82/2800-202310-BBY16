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