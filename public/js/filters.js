document.addEventListener('DOMContentLoaded', function() {
    var buttons = document.getElementsByClassName('dietary-button');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function() {
        var newPreference = this.getAttribute('data-item');
        var storedPreferences = localStorage.getItem('dietaryPreferences');
        var items = storedItems ? JSON.parse(storedItems) : [];

        if (index === -1) {
          addItem(newItem);
        } else {
          removeItem(newItem);
        }
      });
    }
  });

  function addItem(item) {
    axios.post('/addToList', { item: item })
      .then(function(response) {
        updateList(response.data);
      })
      .catch(function(error) {
        console.error('Error adding item to the list:', error);
      });
  }

  function removeItem(item) {
    axios.post('/removeFromList', { item: item })
      .then(function(response) {
        updateList(response.data);
      })
      .catch(function(error) {
        console.error('Error removing item from the list:', error);
      });
  }

  function updateList(updatedList) {
    var listContainer = document.getElementById('list-container');
    listContainer.innerHTML = '';
    updatedList.forEach(function(item) {
      var listItem = document.createElement('li');
      listItem.textContent = item;
      listContainer.appendChild(listItem);
    });
  }