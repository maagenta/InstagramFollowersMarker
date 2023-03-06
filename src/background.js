// background-script.js

// Send a Message to content-script when URL changed
function sendMessageOfUrlChanged(tab) {
    browser.tabs
      .sendMessage(tab[0].id, { url_changed : 1 })
      .catch(onError);
}

// Show errors in console
function onError(error) {
  console.error(`Error: ${error}`);
}

// Detects when page URL changes
browser.tabs.onUpdated.addListener(() => {
  browser.tabs.query({currentWindow: true,active: true,})
    .then(sendMessageOfUrlChanged)
    .catch(onError);
});

// Reads CSV database and convert it to an object
async function ext_database_to_object() {
	const extDatabaseURL = browser.runtime.getURL("database.csv")
	let extDatabase;

	database = await fetch(extDatabaseURL)
	.then(response => response.text())
	.then(rawFileContent => readDatabase(rawFileContent));

	function readDatabase(rawFileContent) {
		extDatabase = rawFileContent;
		extDatabase = extDatabase.split('\n');
		extDatabase.shift();
		extDatabase = extDatabase.map(
		(element,index) => {
				let row = element.split(" ");
				element = {};
				element.ig_account = row[0];
				element.marked = row[1];
				return element;
		});
		//console.log(extDatabase);
		//extDatabase = {database: extDatabase};
		//return extDatabase;
	}
	return extDatabase;
}

// Creates the database
async function create_local_database(){
	database = await ext_database_to_object();
	console.log(database);
	browser.storage.local.set({database});
}

create_local_database();
