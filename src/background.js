// background-script.js

/** Receives messages **/
browser.runtime.onMessage.addListener(message_received);

async function message_received(action){
	switch (action.action){
		case "csv-file-uploaded":
			let csvUpateState = await update_database_merging_csv_file(action.csvFileUrl);
			return Promise.resolve(csvUpateState);
			break;
		case "export-to-csv-file":
			const csvDatabaseFile = await convert_to_csv();
			download_csv_file(csvDatabaseFile);
			break;
		case "mark-account":
			console.log("Botón presionado");
			add_to_local_database(action.account, action.markedList);
			break;
	}
}

/** Send a Message to content-script when URL changed **/
browser.tabs.onUpdated.addListener(sendMessageOfUrlChanged)
async function sendMessageOfUrlChanged() {
	const tab = await browser.tabs.query({currentWindow: true,active: true,});
	console.log(tab[0].id);
	if (tab[0].url.includes(".instagram.")){
		console.log("passed");
    	browser.tabs.sendMessage(tab[0].id, { url_changed : 1 });
    }
}


/** Init the local database **/
let database = {database: []};
async function init_local_database(){
	const localDatabase = await browser.storage.local.get();
	if (!('database' in localDatabase) || localDatabase.database === undefined)
		browser.storage.local.set(database);
}


/** Adds accounts to the database **/
async function add_to_local_database(igAccount,listType){
	let tempDatabase = await browser.storage.local.get(database);
	if(!tempDatabase.database.some(list => list.ig_account == igAccount)){ //Prevents errors checking if the account is already in the database
		tempDatabase.database.push({ig_account: igAccount, marked: listType});
	}
	console.log(tempDatabase);
	await browser.storage.local.set(tempDatabase);
	console.log(browser.storage.local.get());
}

/** Update the database with csv file **/
async function update_database_merging_csv_file(extDatabaseURL){

	function merge_databases(local,external){
		console.log("Externa",external);
		console.log("Local",local);
		const checkDatabaseConsidences = item => !local.database.some(bItem => item.ig_account === bItem.ig_account);
		const filterDatabaseCoinsidences = external.database.filter(checkDatabaseConsidences);
		console.log("To add:",filterDatabaseCoinsidences);
		const _database = local.database.concat(filterDatabaseCoinsidences);
		return {database: _database};
	}

	const extDatabase = await ext_database_to_object(extDatabaseURL);
	let localDatabase = await browser.storage.local.get();

	// Check the integrity of the database
	if(extDatabase[0] == false){
		console.log("The database is broken");
		return extDatabase;
	}
	
	if (!('database' in localDatabase) || localDatabase.database === {}) {
		database = extDatabase;
	}
	else{
		database = merge_databases(localDatabase, extDatabase);
	}
	browser.storage.local.set(database);
	//console.log(await browser.storage.local.get());

	return [true, "Database has been imported succesfully"];
}


/** Reads CSV database and convert it to an object **/
async function ext_database_to_object(extDatabaseURL) {
	//const extDatabaseURL = browser.runtime.getURL("database.csv")
	let extDatabase, database, dataToReturn;

	await fetch(extDatabaseURL)
	.then(response => response.text())
	.then(rawFileContent => return_object(rawFileContent));

	// 
	function return_object(rawFileContent) {
		console.log(is_a_valid_database(rawFileContent));
		isAvalidDataBase = is_a_valid_database(rawFileContent);
		if (isAvalidDataBase[0]) dataToReturn = read_database(rawFileContent);
		else dataToReturn = isAvalidDataBase;
	}

	// Return data
	return dataToReturn;

	// Comprobe if is a valid csv database
	function is_a_valid_database(rawFileContent){
		console.log("Comprobing Database...");
		let errMessage, extDatabase, isValidDatabase;
		isValidDatabase = false;

		extDatabase = rawFileContent.split('\n');
		if(extDatabase[0] === "ig_account marked"){ // The head should be "ig_account marked"
			console.log("First step passed");
			if(!(extDatabase.length === 1)){ // Database has entries?
				console.log("Database length passed");
				extDatabase = extDatabase.map(element => element.split(" "));
				if(extDatabase.every(subarray => subarray.length === 2)){ // Each line need to have two entries
					console.log("Subarray length passed");
					extDatabase.shift();
					console.log("Array",extDatabase)
					if(extDatabase.every(
						subarray => typeof subarray[0] === "string" && ((subarray[1] == "0") || (subarray[1] == "1")))) // Each element is valid?
					{
						console.log("All passed");
						isValidDatabase = true;
						return [true];
					}
					else {
						errMessage = "The second element of at least one entry isn't 0 or 1\n" +
									  "Remember that the second entry of the entry needs to be 0 or 1"
					}
				}
				else {
					errMessage = "At least one entries of the database doesn't contain two elements\n" +
								 "All entries of the database needs to contain two elementets"
				}
			}
			else {
				errMessage = "The database hasn't entries"
			}
		}
		else {
			errMessage = "The database headers aren't correct\n" +
						 "They should be: 'ig_account marked'"
		}
		if(!isValidDatabase) {
			return [false, errMessage];
		}
	}

	// Read the database
	function read_database(rawFileContent) {
		console.log("Reading Database...");
		extDatabase = rawFileContent;
		extDatabase = extDatabase.split('\n');
		extDatabase.shift();
		const database = extDatabase.map(
		(element) => {
				let row = element.split(" ");
				element = {};
				element.ig_account = row[0];
				element.marked = row[1];
				return element;
		});
		return {database};
	}
}


/** Convert actual database to csv **/
async function convert_to_csv() {
	let csvDatabase;
	const database = await browser.storage.local.get("database");
	console.log("This is the database:", database);
	csvDatabase = database.database.map(element => {
		let databaseArray = [];
		databaseArray[0] = element.ig_account;
		databaseArray[1] = element.marked;
		let databaseString = databaseArray.join(" ");
		return databaseString;
	})
	csvDatabase.unshift("ig_account marked")
	csvDatabase = csvDatabase.join("\n");
	console.log("Database that was converted to csv:",csvDatabase);
	const csvDatabaseFile = new Blob([csvDatabase], {type: "text/plain"});
	return csvDatabaseFile;
}


/** Save csv file **/
function download_csv_file (csvFile) {
	console.log("Este es el archivo",csvFile);
	const csvFileUrl = URL.createObjectURL(csvFile);
	const csvFilename = "database.csv";

	browser.downloads.download({
		url: csvFileUrl,
		filename: csvFilename
	})
}


async function test() {
	await init_local_database();
	// const csvDatabaseFile = convert_to_csv(database);
	//download_csv_file(csvDatabaseFile);
	console.log(browser.storage.local.get());
}

test();