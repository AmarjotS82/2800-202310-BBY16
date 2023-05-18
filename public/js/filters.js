document.addEventListener('DOMContentLoaded', function() {
    var buttons = document.getElementsByClassName('dietary-button');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', async function() {
        var newPreference = this.getAttribute('data-item');

        await fetch('http://localhost:3020/updateDietaryPreference/' + newPreference);
   
      });
    }
  });