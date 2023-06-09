//this clears the modal since we have a lot
var modalWrap = null;
//shows and creates a modal
const showModal = (title, description) => {
    if (modalWrap !== null) {
      modalWrap.remove();
    }
  
    //creates a modal
    modalWrap = document.createElement('div');
    modalWrap.innerHTML = `
      <div class="modal fade" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-light">
              <h5 class="modal-title">${title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>${description}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    //appends the modal
    document.body.append(modalWrap);
  
    var modal = new bootstrap.Modal(modalWrap.querySelector('.modal'));
    modal.show();
  }
  
//this adds a listener to each modal button id
$('#modal-btn').each(function() {
    //this is the listener
    $('.modal-btn').click( async function() {
        const id = $(this).attr('object-id')
        const response = await fetch('/recipe/' + id);
        const data = await response.json();
        console.log(data);
        showModal(data[0].recipeName, data[0].recipe);  
    
    });
})

//if no saved recipe found then this will display a "No saved recipes" text.
if($('#recipe-list li').length == 0) {
    const h1 = document.createElement('h1');
    const text = document.createTextNode("No saved recipes");
    h1.appendChild(text);
    const body = document.getElementsByTagName('body')[0]; 
    body.appendChild(h1);
}