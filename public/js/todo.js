/*This feature is inspired from chatgpt and made some modification 
based on our app features and needs.
*/

//assigning classes into a const variable 
const todoInput = document.querySelector(".todo-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const filterOption = document.querySelector(".filter-todo");



// adding event listener
document.addEventListener("DOMContentLoaded", getLocalTodos);
todoButton.addEventListener("click", addTodo);
todoList.addEventListener("click", deleteCheck);
filterOption.addEventListener("click", filterTodo);


//function to create a new todo item in the list
function addTodo(event){
    event.preventDefault(); //prevents default behaviour of form submission
    const todoDiv = document.createElement("div"); // creates a div and assigns element to it 
    todoDiv.classList.add("todo");
    const newTodo = document.createElement("li");
    newTodo.innerText = todoInput.value;
    newTodo.classList.add("todo-item");
    todoDiv.appendChild(newTodo);
    
    saveLocalTodos(todoInput.value); //adding to the local storage

    const completedButton = document.createElement("button"); // create check button
    completedButton.innerHTML = ' <i class="fas fa-check-circle"></li>'; //icon will show after user created list
    completedButton.classList.add("complete-btn");
    todoDiv.appendChild(completedButton);

    const trashButton = document.createElement("button"); // create trash button
    trashButton.innerHTML = '<i class="fas fa-trash"></li>';
    trashButton.classList.add("trash-btn");
    todoDiv.appendChild(trashButton);

    todoList.appendChild(todoDiv); 
    todoInput.value = "";
}

// handles the deletion of todo items when the trash button is clicked
function deleteCheck(e) {
    const item = e.target; // assigns target property of the event object
    if(item.classList[0] === "trash-btn"){ //checks if the item has class of trash-btn
        const todo = item.parentElement;
        todo.classList.add("slide"); // adds class slide

        removeLocalTodos(todo); //calls remove function to remove it from local storage
        todo.addEventListener("transitionend", function(){ // event listener which fired the css transition 
            todo.remove(); 
        });
    }
    if (item.classList[0] === "complete-btn"){ // check if the event has class of complete-btn 
        const todo = item.parentElement;   // assigns parent elemnt of item to the todo constant
        todo.classList.toggle("completed"); // toggles the "completed" class on the todo element,which change css
    }
}

//filtering complete and incomplte list
function filterTodo(e) { //event triggored the function
    const todos = todoList.childNodes; // selects all the child nodes
    todos.forEach(function(todo) { // iterate over each todo element
        switch(e.target.value) { //determine the selected filter option based on the value property of e.target
            case "all":  // if selected all displays all the elemnents
                todo.style.display = "flex";
                break;
            case "completed": 
                if(todo.classList.contains("completed")) { // if selected is complte it displays completed ones
                    todo.style.display = "flex";
                } else {
                    todo.style.display = "none";
                }
                break;
            case "incomplete": // if incomplete it displays incompleted one
                if(!todo.classList.contains("completed")) {
                    todo.style.display = "flex";
                } else {
                    todo.style.display = "none";
                }
                break;
        }
    });
}

//saving list into local storage function
function saveLocalTodos(todo) {
    let todos;
    if(localStorage.getItem("todos") === null) {
    todos =[]
} else {
    // Retrieves the stored todos from the local storage 
    todos = JSON.parse(localStorage.getItem("todos"));
}
//Adds the new todo item
todos.push(todo);
localStorage.setItem("todos", JSON.stringify(todos));
}

function getLocalTodos() {
    let todos;
    if(localStorage.getItem("todos") === null){
        //if null initilize the array to empty
        todos = [];
    }else{
        //Retrieves the stored todos from the local storage
        todos = JSON.parse(localStorage.getItem("todos")); 
    }
    todos.forEach(function(todo){ // iterate over each todo item
        const todoDiv = document.createElement("div");
        todoDiv.classList.add("todo");
        const newTodo = document.createElement("li");
        newTodo.innerText = todo;
        newTodo.classList.add("todo-item");
        todoDiv.appendChild(newTodo);

        const completedButton = document.createElement("button");
        completedButton.innerHTML = '<i class="fas fa-check-circle"></li>';
        completedButton.classList.add("complete-btn");
        todoDiv.appendChild(completedButton);
        //new button for cleaning to do
        const trashButton = document.createElement("button");
        trashButton.innerHTML= '<i class="fas fa-trash"></li>';
        trashButton.classList.add("trash-btn");
        todoDiv.appendChild(trashButton);

        todoList.appendChild(todoDiv);
    });
}

// removed the todo items from todo list in local storage
function removeLocalTodos(todo) {
    let todos;
    //Checks if the key "todos" in the local storage has a value of null
    if(localStorage.getItem("todos") === null){
    todos = []; //initilize empty array
    }else{
        todos = JSON.parse(localStorage.getItem("todos")); // Retrieves the stored todos from the local storage by using the key 
    }
    const todoIndex = todo.children[0].innerText;
    // Finds the index of the todoIndex value in the todos array, then removes it
    todos.splice(todos.indexOf(todoIndex), 1);
    //stores the updated array back to local storage
    localStorage.setItem("todos", JSON.stringify(todos));
}

$("body").on("click", ".reset", function(){
    console.log("reset clicked")
    $(".todo").remove();
    localStorage.clear();
    
})
