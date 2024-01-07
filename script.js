// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', function () {
    // Get references to form, item list, and error text elements
    const form = document.getElementById('itemForm');
    const itemList = document.getElementById('itemList');
    const errorText = document.getElementById('errorText');
  
    // Handle form submission
    form.addEventListener('submit', function (event) {
      event.preventDefault();
  
      // Get the item name from the input field
      const itemNameInput = document.getElementById('itemName');
      const itemName = itemNameInput.value.trim();
  
      // Validate the input and add item if valid
      if (validateInput(itemName)) {
        addItem(itemName);
        itemNameInput.value = '';
        errorText.textContent = ''; // Clear error message on successful submission
      }
    });
  
    // Handle item list interactions (delete and edit)
    itemList.addEventListener('click', function (event) {
      if (event.target.classList.contains('delete')) {
        deleteItem(event.target.parentNode);
      } else if (event.target.classList.contains('edit')) {
        editItem(event.target.parentNode);
      }
    });
  
    // Enable drag-and-drop functionality for the item list
    enableDragAndDrop(itemList);
  });
  
  // Function to validate input (item name)
  function validateInput(input) {
    if (input === '') {
      // Display error message if input is empty
      document.getElementById('errorText').textContent = 'Item name cannot be empty';
      return false;
    }
  
    // Return true if input is valid
    return true;
  }
  
  // Function to add a new item to the list
  function addItem(itemName) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <span class="drag-handle" role="button" aria-label="Drag item">&#x2630;</span>
      <span>${itemName}</span>
      <button class="edit" aria-label="Edit item">Edit</button>
      <button class="delete" aria-label="Delete item">Delete</button>
    `;
  
    listItem.draggable = true; // Make the entire list item draggable
  
    // Set ARIA attributes for the drag handle
    const dragHandle = listItem.querySelector('.drag-handle');
    dragHandle.tabIndex = 0; // Make it focusable
    dragHandle.setAttribute('aria-grabbed', 'false');
    dragHandle.addEventListener('keydown', handleDragHandleKeyDown);
  
    // Append the new item to the item list
    document.getElementById('itemList').appendChild(listItem);
  }
  
  // Function to delete an item from the list
  function deleteItem(item) {
    item.parentNode.removeChild(item);
  }


// Function to edit an item in the list
function editItem(item) {
    const span = item.querySelector('span:not(.drag-handle)'); // Exclude the drag handle
  
    // Create a Bootstrap modal for editing
    const modal = document.createElement('div');
    modal.classList.add('modal', 'fade');
    modal.id = 'editItemModal';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Item</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <label for="editItemInput">Edit Item:</label>
            <input type="text" id="editItemInput" class="form-control" value="${span.textContent}">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" id="saveEditBtn">Save</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  
    // Show the Bootstrap modal
    $('#editItemModal').modal('show');
  
    // Add event listeners for the modal buttons
    const saveEditBtn = document.getElementById('saveEditBtn');
    saveEditBtn.addEventListener('click', function () {
      const updatedItemName = document.getElementById('editItemInput').value.trim();
  
      if (updatedItemName !== '') {
        span.textContent = updatedItemName;
        // Hide the Bootstrap modal
        $('#editItemModal').modal('hide');
      } else {
        alert('Item name cannot be empty. Item not updated.');
      }
    });
  }
  

  // Function to handle keyboard events for the drag handle
  function handleDragHandleKeyDown(event) {
    const SPACE_KEY = 32;
  
    if (event.keyCode === SPACE_KEY) {
      event.preventDefault();
      toggleAriaGrabbed(event.target);
    }
  }
  
  // Function to toggle the aria-grabbed attribute
  function toggleAriaGrabbed(element) {
    const ariaGrabbed = element.getAttribute('aria-grabbed') === 'true';
    element.setAttribute('aria-grabbed', String(!ariaGrabbed));
  }
  
  // Function to enable drag-and-drop functionality for the item list
  function enableDragAndDrop(list) {
    let draggedItem = null;
  
    // Handle the start of the drag operation
    list.addEventListener('dragstart', function (event) {
      draggedItem = event.target;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', ''); // Required for Firefox
    });
  
    // Handle the dragover event to determine the drop position
    list.addEventListener('dragover', function (event) {
      event.preventDefault();
      const targetItem = getDragAfterElement(list, event.clientY);
      const isSameContainer = targetItem && targetItem.parentNode === draggedItem.parentNode;
  
      // Handle dropping the item at the correct position
      if (!targetItem) {
        list.appendChild(draggedItem);
      } else if (!isSameContainer) {
        targetItem.parentNode.insertBefore(draggedItem, targetItem);
      }
    });
  
    // Handle the end of the drag operation
    list.addEventListener('dragend', function () {
      draggedItem = null;
    });
  
    // Function to determine the position to drop the dragged item
    function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
  
      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
  
        // Find the closest element based on the offset
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        }
  
        return closest;
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
  }
  