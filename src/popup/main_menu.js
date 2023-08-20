'use strict'
import * as modalBox from "./modal_box.js"

/** Begin flow **/
input_user_preferences();
add_triggers();

/** Adds event triggers to objects when they've the attribute "action" **/
function add_triggers(){
	const actionDomObjects = document.querySelectorAll("[action]");
	console.log("add_trigger: elements that's going to add triggers",actionDomObjects);
	actionDomObjects.forEach( element => {
		let event;
		if (element.tagName == "INPUT") event = "change";
		else event = "click";
		element.addEventListener(event, do_action);
	});
}

/** Triggers the action to background using the action value **/
async function do_action(triggeredElement){
	let action = triggeredElement.target.getAttribute("action");
	if(action.includes("userPrefs"))  {
		action = {
			action: "switch-user-preference",
			userPref: action.slice(10),
			state: triggeredElement.target.checked
		};
		browser.runtime.sendMessage(action);
		const tabs = (await browser.tabs.query({})).filter(tab => tab.url.includes(".instagram."));
		tabs.forEach(tab => {
			console.log(tab);
			browser.tabs.sendMessage(tab.id, {userPrefs_changed: true});
		})
	}
	else {
		browser.runtime.sendMessage({action});
	}
}

/** User prefs checkbox **/
async function input_user_preferences(){
	const userPreferencesContainer = document.getElementById("user-preferences");
	const userPreferencesCheckboxes = userPreferencesContainer.querySelectorAll("input");
	const userPrefs = (await browser.storage.local.get("userPrefs")).userPrefs;
	console.log("input_user_preferences: preferences:",userPrefs);
	userPreferencesCheckboxes.forEach(input => {
		const preference = input.getAttribute("action").slice(10);
		console.log(preference,userPrefs[preference]);
		if (userPrefs[preference]){
			input.checked = true;
		}
		else input.checked = false;
	});
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