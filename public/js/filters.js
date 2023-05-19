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