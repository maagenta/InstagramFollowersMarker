/* Declares global variables */
let fileInput, importCsvTrigger;


/** Creates hidden file input form **/
function csv_file_input() {
	fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.width = "0px";
	fileInput.height = "0px";
	fileInput.style.visibility = "hidden";
	fileInput.addEventListener("change", send_csv_file_url)
	document.body.appendChild(fileInput);
	importCsvTrigger = document.getElementById("import-csv");
	importCsvTrigger.addEventListener("click", () => fileInput.click());
}


/** Imports csv file **/
function send_csv_file_url(csvFile){

	// Alerts the result of trying importing the csv file
	function notify_importing_csv_file_state(importingState){
		alert(importingState[1]);
	}

	csvFileUrl = URL.createObjectURL(csvFile.target.files[0]);
	browser.runtime.sendMessage({action: "csv-file-uploaded", csvFileUrl: csvFileUrl})
	.then(response => notify_importing_csv_file_state(response));
}


/** Adds event triggers to objects that has the attribute action="true" **/
function add_triggers(){
	actionDomObjects = document.querySelectorAll("[action='true']");
	console.log(actionDomObjects);
	actionDomObjects.forEach( element => {element.addEventListener("click", do_action)});
}


/** Triggers the action to backrgound using the id as the action descriptor **/
function do_action(triggeredElement){
	const action = triggeredElement.target.id;
	browser.runtime.sendMessage({action: action});
}


csv_file_input();
add_triggers();