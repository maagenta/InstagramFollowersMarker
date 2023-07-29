import * as modalBox from "./modal_box.js"; //import modal box

/** Define buttons **/
const csvFilePicker = document.getElementById("csv-file-picker");
const csvUploadButton = document.getElementById("csv-upload-button");

/** Flow **/
csvUploadButton.addEventListener("click",upload_csv_file);

/** Upload button flow **/
async function upload_csv_file(){
	let csvData;
	const reader = new CustomFileReader();
	const file = csvFilePicker.files[0];
	if (!file) {
		open_modal_box("csv-file-not-selected");
		return false;
	}
	const csvContent = await reader.readAsText(csvFilePicker.files[0]);
	console.log("upload_csv_file: Reader result:",csvContent);
	const isAvalidDataBase = is_a_valid_database(csvContent);
	console.log("upload_csv_file: Is a valid db?",isAvalidDataBase.check);
	if (isAvalidDataBase.check) {
		csvData = database_to_object(csvContent);
		console.log("upload_csv_file: csv converted in an object:",csvData);
		const message = {action: "import-csv-to-database", csvData: csvData};
		browser.runtime.sendMessage(message)
			.then(msg => {
				console.log("upload_csv_file: Database uploaded, message from background:",msg);
				open_modal_box("csv-database-imported");
			})
			.catch(err => {
				err.name = 	"";
				err = err.toString();
				console.log("upload_csv_file: Error uploading csv database:",err);
				open_modal_box(err);
			});
	}
	else { 
		console.log("upload_csv_file:",isAvalidDataBase.Message);
		open_modal_box(isAvalidDataBase.Message);
	}
	
}


/** Reads CSV database and convert it to an object **/
function database_to_object(FileContent) {
	//open_modal_box();
	let extDatabase;
	console.log("return_object: Reading Database...");
	extDatabase = FileContent;
	extDatabase = extDatabase.split('\n');
	extDatabase.shift();
	const database = extDatabase.map(
	(element) => {
			let row = element.split(" ");
			element = {};
			element.ig_account = row[0];
			element.marked = parseInt(row[1]);
			return element;
	});
	return {database};
}

/* Comprobes if is a valid csv database */
function is_a_valid_database(FileContent){
	console.log("is_a_valid_database: Comprobing Database...");
	let Message, extDatabase, isValidDatabase;
	isValidDatabase = false;

	extDatabase = FileContent.split('\n');
	if(extDatabase[0] === "ig_account marked"){ // The head should be "ig_account marked"
		console.log("is_a_valid_database: First step passed");
		if(!(extDatabase.length === 1)){ // Database has entries?
			console.log("is_a_valid_database: Database length passed");
			extDatabase = extDatabase.map(element => element.split(" "));
			if(extDatabase.every(subarray => subarray.length === 2)){ // Each line need to have two entries
				console.log("is_a_valid_database: Subarray length passed");
				extDatabase.shift();
				console.log("is_a_valid_database: Array",extDatabase)
				if(extDatabase.every(
					subarray => typeof subarray[0] === "string" && ((subarray[1] == "0") || (subarray[1] == "1"))
					)) // Each element is valid?
				{
					console.log("is_a_valid_database: All passed");
					isValidDatabase = true;
					return {check: true};;
				}
				else {
					Message = "The second element of at least one entry isn't 0 or 1\n" +
								  "Remember that the second entry of the entry needs to be 0 or 1"
				}
			}
			else {
				Message = "At least one entries of the database doesn't contain two elements\n" +
							 "All entries of the database needs to contain two elementets"
			}
		}
		else {
			Message = "The database hasn't entries"
		}
	}
	else {
		Message = "The database headers aren't correct\n" +
					 "They should be: 'ig_account marked'"
	}
	if(!isValidDatabase) {
		return {check: false, Message: Message};
	}
}


/* Creates a custom FileReader class */
class CustomFileReader {
	constructor(){
		this.fileReader = new window.FileReader();
	}
	readAsText(file){
		return new Promise(
			(resolve,reject) => {
				console.log("CustomFileReader: Reading as a text");
				this.fileReader.addEventListener("load", (e) => {resolve(e.target.result)});
				this.fileReader.addEventListener("error", (e) => {reject(e)});
				this.fileReader.readAsText(file);
			}

		)
	}
}

/* Modal_box code */
function open_modal_box(message) {
	if(message) message = message.replace("\n","<br>");
	const warningModalBox =
	`
	<div class="modal" style="display: block;">
	  <div class="modal-dialog modal-dialog-centered">
	    <div class="modal-content">
	      <div class="modal-header">
	        <h1 class="modal-title fs-5" id="exampleModalCenterTitle">
				${message == "csv-database-imported" ? "CSV database successfully imported" : ""}
	        	${message == "csv-file-not-selected" ? "Please, select a file" : ""}
				${message != "csv-database-imported" && message != "csv-file-not-selected" ?  "Error uploading CSV file" : ""}
	        </h1>
	        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
	      </div>
	      <div class="modal-body">
	        <p>
			${message == "csv-database-imported" ? "The csv database has been imported!" : ""}
			${message == "csv-file-not-selected" ? "The file doesn't passed database comprobation and the following error has been generated:" : ""}
	        ${message != "csv-database-imported" && message != "csv-file-not-selected" ? "You have forgotten to pick a file." : ""}
	        </p>
	        ${message != "csv-database-imported" ? `<div class="modal-message"><code>${message}</code></div>` : ""}
	      </div>
	      <div class="modal-footer">
		 	 <button type="button" class="btn btn-dark">
			  	${message == "csv-database-imported" ? "Ok" : "I understand"}
			 </button>
	      </div>
	    </div>
	  </div>
	  </div>
	`
	modalBox.open(warningModalBox);
}