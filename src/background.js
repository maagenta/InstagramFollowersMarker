// background-script.js

/** Init extension functions **/
init_local_database();
init_userPrefs();

/** Receives messages **/
browser.runtime.onMessage.addListener(message_received);

async function message_received(action){
	console.log("Background: Message Received");
	switch (action.action){
		case "switch-user-preference":
			console.log("In switch-user-preference",action.userPref,action.state);
			set_user_preference(action.userPref,action.state);
			break;
		case "import-csv-to-database":
			try {
				import_csv_database = await import_csv_database(action.csvData);
				return Promise.resolve(import_csv_database);
			}
			catch(err){
				console.log("import-csv-to-database:",err);
				err = new Error(err);
				return Promise.reject(err);
			};
			break;
		case "export-to-csv-file":
			const csvDatabaseFile = await convert_to_csv();
			download_csv_file(csvDatabaseFile);
			break;
		case "mark-account":
			console.log("Button pressed to mark account:", action.account);
			add_entry_to_local_database(action.account, action.markedList);
			break;
		case "unmark-account":
			console.log("Button pressed to unmark account:", action.account);
			remove_entry_of_local_database(action.account);
			break;
		case "reset-database":
			reset_database();
			break;
		case "update-accounts-at-all-tabs":
			update_accounts();
			break;
	}
}

/** Send a Message to content-script when URL changed **/
browser.tabs.onUpdated.addListener(sendMessageWhenUrlChanged)
async function sendMessageWhenUrlChanged() {
	const tab = await browser.tabs.query({currentWindow: true,active: true,});
	console.log(tab[0].id);
	if (tab[0].url.includes(".instagram.")){
		console.log("passed");
    	browser.tabs.sendMessage(tab[0].id, { url_changed : true });
    }
}


/** Init the local database **/
async function init_local_database(){
	const cleanDatabase = {database: []};
	const localDatabase = await browser.storage.local.get();
	if (!('database' in localDatabase) || localDatabase.database === undefined)
		browser.storage.local.set(cleanDatabase);
}

/** Init the userPrefs **/
async function init_userPrefs(){
	const cleanUserPrefs = {
		userPrefs: {
			showButtonMarker: true,
			highlightMarkedProfiles: true,
			ctrlClick: true
		}
	};
	const localUserPrefs = await browser.storage.local.get('userPrefs');
	if (!localUserPrefs || Object.keys(localUserPrefs).length === 0){
		browser.storage.local.set(cleanUserPrefs);
	}
}

/** Adds accounts to the database **/
async function add_entry_to_local_database(igAccount,listType){
	const localDatabase = (await browser.storage.local.get('database')).database;
	let tempDatabase = localDatabase;
	console.log("add_entry_to_local_database: Element to add:",igAccount,"ListType of element to add:",listType);
	//console.log(igAccount,tempDatabase.database.some(list => list.ig_account == igAccount));
	if(!tempDatabase.some(list => list.ig_account == igAccount)){ //Prevents errors checking if the account is already in the database
		tempDatabase.push({ig_account: igAccount, marked: listType});
	}
	console.log("add_entry_to_local_database: Temporal database after added element:", tempDatabase);
	const database = {database: tempDatabase};
	await browser.storage.local.set(database);
	console.log("add_entry_to_local_database: Database after added element:",database);
}

/** Delete accounts of the database **/
async function remove_entry_of_local_database(igAccount){
	const localDatabase = (await browser.storage.local.get('database')).database;
	let tempDatabase = localDatabase;
	const indexOfDatabase = tempDatabase.findIndex(username => username.ig_account == igAccount);
	tempDatabase.splice(indexOfDatabase,1);
	console.log("remove_entry_of_local_database: Element to remove:",igAccount);
	console.log("remove_entry_of_local_database: Temporal database after removed element:",tempDatabase);
	const database = {database: tempDatabase};
	await browser.storage.local.set(database);
	console.log("remove_entry_of_local_database: Database after removed element:",database);
}

/** Reset Database */
async function reset_database(){
	const database = {database: []};
	console.log("reset_database: Begin reset database...")
	browser.storage.local.set(database);
	console.log("Database reseted", await browser.storage.local.get("database"));
}

/** Change a user preference **/
async function set_user_preference(userPref,state){
	let tempUserPrefs;
	tempUserPrefs = await browser.storage.local.get("userPrefs");
	tempUserPrefs.userPrefs[userPref] = state;
	console.log("set_user_preferences: temp preferences :", tempUserPrefs);
	browser.storage.local.set(tempUserPrefs);
}

/** Update the database with csv file **/
async function import_csv_database(csvDatabase){
	const extDatabase = csvDatabase;
	let localDatabase = await browser.storage.local.get('database');
	let extDatabaseNewEntries;
	console.log("import_csv_database: begining");
	// Check the integrity of the external database
	if(extDatabase[0] == false){
		const errMessage = "The database is broken";
		console.log("import_csv_database: The database is broken");
		return Promise.reject(errMessage);
	}

	// The local database is empty?
	if (!('database' in localDatabase) || localDatabase.database.length === 0) {
		database = extDatabase;
	}
	else{
		extDatabaseNewEntries = filter_databases_coincidences(localDatabase, extDatabase);
		// Checks if the database to import has the same entries as the local database
		if(extDatabaseNewEntries.length === 0){
			const errMessage = "The database to import has the same entries as the local database";
			console.log("import_csv_database:",errMessage);
			return Promise.reject(errMessage);
		} else {
			merge_databases(localDatabase,extDatabaseNewEntries); //Merge local and external databases

		}
	}
	
	// Sets the database with the new entries
	browser.storage.local.set(database);
	console.log("merge_databases: The local database after the importation:",await browser.storage.local.get());
	return Promise.resolve("Database has been imported succesfully");

	function filter_databases_coincidences(local,external){
		console.log("import_csv_database->filter_database_coincidences: External database",external);
		console.log("import_csv_database->filter_database_coinciences: Local database",local);
		const checkDatabaseCoincidences = item => !local.database.some(bItem => item.ig_account === bItem.ig_account);
		return external.database.filter(checkDatabaseCoincidences);
	}

	// Merge external and local database
	function merge_databases(local,extDatabaseNewEntries){
		console.log("import_csv_database->merge_databases Entries to add:",extDatabaseNewEntries);
		const _database = local.database.concat(extDatabaseNewEntries);
		return {database: _database};
	}
}


/** Convert actual database to csv **/
async function convert_to_csv() {
	let csvDatabase;
	const database = (await browser.storage.local.get("database")).database;
	console.log("This is the database:", database);
	csvDatabase = database.map(element => {
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

/** Update accounts in all tabs **/
async function update_accounts(){
	kitty = "miuau";
	const tabs = (await browser.tabs.query({})).filter(tab => tab.url.includes(".instagram."));
	tabs.forEach(tab =>	browser.tabs.sendMessage(tab.id, {update_accounts: true}));
}