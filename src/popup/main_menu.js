import * as modalBox from "./modal_box.js"

/** Begin flow **/
add_triggers();

/** Adds event triggers to objects when they've the attribute "action" **/
function add_triggers(){
	const actionDomObjects = document.querySelectorAll("[action]");
	console.log(actionDomObjects);
	actionDomObjects.forEach( element => {element.addEventListener("click", do_action)});
}

/** Triggers the action to background using the action value **/
function do_action(triggeredElement){
	const action = triggeredElement.target.getAttribute("action");
	browser.runtime.sendMessage({action: action});
}

/** Reset database **/
const deleteTrigger = document.getElementById("delete-all");
deleteTrigger.addEventListener("click",open_delete_modal_box);

function open_delete_modal_box() {
	const removeAllModalBox = 
	`
	<div class="modal" style="display: block;">
	  <div class="modal-dialog modal-dialog-centered">
	    <div class="modal-content">
	      <div class="modal-header">
	        <h1 class="modal-title fs-5" id="exampleModalCenterTitle">Delete all database entries</h1>
	        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
	      </div>
	      <div class="modal-body">
	        <p>This will remove all database entries.
	        <br>
	        Are you sure to do this?</p>
	      </div>
	      <div class="modal-footer">
	        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
	        <button type="button" action="reset-database" class="btn btn-danger">Yes, delete all</button>
	      </div>
	    </div>
	  </div>
	  </div>
	`
	modalBox.open(removeAllModalBox);
	add_triggers();
}