/** Global Variables **/
let accountUsername,
	isProfileAccountOnDatabase;


/** Receives external messages **/
browser.runtime.onMessage.addListener((msg) => {
	if('url_changed' in msg){
		console.log("The URL has changed, and the message from background has been received");
		accountUsername = get_account_username();
		isProfileAccountOnDatabase = check_account();
		append_mark_button();
		pink_marked_profiles();
	}
});

/** Sends messages **/
function background_do_action(action) {
	browser.runtime.sendMessage(action);
}

/** Gets account username **/
function get_account_username() {
	const accountUsername = document.querySelector(".x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.x1ms8i2q.xo1l8bm.x5n08af.x10wh9bi.x1wdrske.x8viiok.x18hxmgj").innerText;
	return accountUsername;
}

/** Checks if the account in the profile page is in the database **/
async function check_account() {
	var isAccountMarked;
	if (await check_if_profile_is_in_database(accountUsername)){
		isAccountMarked = true;
	}
	else{
		isAccountMarked = false;
	}
	console.log("Checkeando:",isAccountMarked);
	return isAccountMarked;
}

/** Appends the mark/unmark button **/
async function append_mark_button() {
	console.log("buton begin");

	// Conditionals if not in a profile account
	if (document.querySelector('.ifm_buttonMarker')) {
	    return false;
	}
	
	console.log("Button continue");

	let divContainer = document.querySelector(".x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1n2onr6.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1");
	let buttonDiv0 = document.createElement("div");
	let buttonButton = document.createElement("button");
	let buttonDiv1 = document.createElement("div");
	let buttonDiv2 = document.createElement("div");

	buttonDiv0.className = "_ab8w  _ab94 _ab99 _ab9f _ab9m _ab9o  _abb0 _abcm";
	buttonButton.className = "_acan _acap _acas _aj1- ifm_buttonMarker";
	buttonButton.type = "button";
	buttonButton.style.background = "deeppink";
	buttonDiv1.className = "_ab8w._ab94 _ab97 _ab9h _ab9k _ab9p _ab9x _abcm";
	buttonDiv1.style.height = "100%";
	buttonDiv2.className = "_aacl _aaco _aacw _aad6 _aade";

	if (await isProfileAccountOnDatabase) {
		buttonDiv2.textContent = "Unmark";
	}
	else{
		buttonDiv2.textContent = "Mark";
	}

	buttonDiv1.appendChild(buttonDiv2);
	buttonButton.appendChild(buttonDiv1);
	buttonDiv0.appendChild(buttonButton);
	divContainer.children[0].after(buttonDiv0);


	// Adds the capability for adding to watchlist with ctrl+click
	const ctrlActivate = true;
	if (ctrlActivate) {
		document.addEventListener("keydown", key => {if(key.key == "Control") ctrl_mark_button(key)});
		document.addEventListener("keyup", key => {if(key.key == "Control") ctrl_mark_button(key)});
	}

	function ctrl_mark_button(key) {
		if (key.type == "keydown"){
			buttonButton.style.background = "purple";
		}
		else {
			buttonButton.style.background = "deeppink";
		}

	}

	// On click adds the account to the database
	buttonButton.addEventListener("click", ()=>{mark_unmark_account(buttonDiv2)});

}

/** Mark or unmark an profile account (markButton action) **/
async function mark_unmark_account(buttonDiv2){

	//console.log("Button pressed");
	const checkedAccount = await check_account();
	
	if (checkedAccount) {
		console.log("Button in Unmark-mode pressed with the follow account username:", accountUsername);
		background_do_action({action: "unmark-account", account: accountUsername});
		buttonDiv2.textContent = "Mark";
		pink_unpink_profiles('unmark');
	}
	else {
		console.log("Button in Mark-mode pressed with the follow account username:", accountUsername);
		background_do_action({action: "mark-account", account: accountUsername, markedList: 1});
		console.log("Marked User:",accountUsername);
		buttonDiv2.textContent = "Unmark";
		pink_unpink_profiles('mark');
	}

}

/** Set profile elements that will be pinked **/
function set_profile_elements() {
	//Elements that are pinked when there are marked
	let profile = {};
	profile.user = document.querySelector(".x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.x1ms8i2q.xo1l8bm.x5n08af.x10wh9bi.x1wdrske.x8viiok.x18hxmgj");
	profile.userDetails_1 = document.querySelector(".x78zum5.x1q0g3np.xieb3on");
	profile.userDetails_2 = document.querySelector("._aa_c");
	profile.userStories = document.querySelector("._ab05");
	return profile;
}

/** Pink profiles if it's marked when a profile page is charged **/
async function pink_marked_profiles(){

	const profile = set_profile_elements();

	// Check if an element exist
	if(!profile.user){
		console.log("1");
		return false;
	}
	else if (!profile.userDetails_1){
		console.log("2");
		return false;
	}
	else if (!profile.userDetails_2){
		return false;
	}
	// Check if the Profile is in database
	else if(!(await isProfileAccountOnDatabase)){ 
		return false;
	}
	else if (profile.user.style.color == "deeppink"){
		return false;
	}

	pink_unpink_profiles();

}

/** Account Username/Description/Stories with pink color **/
async function pink_unpink_profiles(ProfileMarkUnmarkButton) {

	const profile = set_profile_elements();

	console.log("The profile object:",profile);

	// Paint or unpaint elements. Paint by default or according to when Mark button is pressed
	switch (ProfileMarkUnmarkButton) {
		default:
			paint_elements();
			break;
		case "mark":
			paint_elements();
			break;
		case "unmark":
			unpaint_elements();
			break;
	}

	function paint_elements() {
		console.log("Painting elements");
		profile.user.style.color = "deeppink";
		pink_all(profile.userDetails_1, "hotpink");
		pink_all(profile.userDetails_2, "hotpink");
		if(profile.userStories) pink_all(profile.userStories, "deeppink");
	}

	function unpaint_elements(){
		console.log("Unpainting elements");
		profile.user.style.removeProperty("color");
		console.log("Unpainted?");
		unpink_all(profile.userDetails_1, "hotpink");
		unpink_all(profile.userDetails_2, "hotpink");
		if(profile.userStories) unpink_all(profile.userStories, "deeppink");
	}
}


/** In the account list, marked accounts with Pink **/
function marked_users_to_pink() {

	function searchBox_context(){
		let account = {};
		account.context = "searchBox"; //only for debugging purposes
		account.searchBox = ".x9f619.x78zum5.xdt5ytf.x12dtdjy.x6ikm8r.x1odjw0f.x4uap5.x18d9i69.xkhd6sd.xh8yej3.x1iyjqo2.xocp1fn";
		account.username = ".x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft div span.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.xt0psk2.x1i0vuye.xvs91rp.x1s688f.x5n08af.x10wh9bi.x1wdrske.x8viiok.x18hxmgj";
		account.description = ".x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xo1l8bm.x1roi4f4.x10wh9bi.x1wdrske.x8viiok.x18hxmgj .x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft";
		account.descriptionFilter = "a:not([href*='/tags/'])"; // filter tags
		account.username = account.searchBox + " " + account.username ;
		account.description = account.searchBox + " " + account.descriptionFilter + " " + account.description;

		pink_accounts({...account});
	}

	function sidebar_context(){
		let account = {};
		account.context = "sidebar"; //only for debugging purposes
		account.sidebarBox = "._aak6._aak9 ._aak3._agh4 .x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x12nagc.xsgj6o6.x1n2onr6.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1";
		account.username = ".x9f619.xjbqb8w.x1rg5ohu.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1n2onr6.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x6s0dn4.x1oa3qoh.x1nhvcw1";
		account.description = ".x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xo1l8bm.x1roi4f4.x10wh9bi.x1wdrske.x8viiok.x18hxmgj .x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft";
		account.username = account.sidebarBox + " " + account.username;
		account.description = account.sidebarBox + " " + account.description;

		pink_accounts({...account});
	}

	function follow_context(){
		let account = {};
		account.context = "follow"; //only for debugging purposes
		account.followBox = ".xs83m0k.xl56j7k.x1iy3rx.x1n2onr6.x1sy10c2.x1h5jrl4.xieb3on.xmn8rco.x1hfn5x7.x13wlyjk.x1v7wizp.x1l0w46t.xa3vuyk.xw8ag78 ._aano";
		account.username = ".x9f619.xjbqb8w.x1rg5ohu.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1n2onr6.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x6s0dn4.x1oa3qoh.x1nhvcw1";
		account.description = ".x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xvs91rp.xo1l8bm.x1roi4f4.x10wh9bi.x1wdrske.x8viiok.x18hxmgj .x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft";
		account.username = account.followBox + " " + account.username;
		account.description = account.followBox + " " + account.description;

		pink_accounts({...account});
	}
/*
	function popup_account_to_pink() {
		const user = document.querySelector(".x6s0dn4.x78zum5.xmix8c7");
		const userDetails_1 = document.querySelector(".xmix8c7.x1gslohp.x1rva8in");
		const userDetails_2 = document.querySelector(".x6s0dn4.xrvj5dj.x8l38fb.x1rp53t7");

		if (!(user.length == 0)){
			pink_all(user, "deeppink");
			pink_all(userDetails_1, "hotpink");
			pink_all(userDetails_2, "hotpink");
		}
	
	}*/

	async function pink_accounts(account){
		account.usernameDocumentElements = document.querySelectorAll(account.username);
		account.descriptionDocumentElements = document.querySelectorAll(account.description);
		//if(account.context == "sidebar") console.log("Description to pink:", account);

		if(account.usernameDocumentElements[0]){
			checkedAccounts = await check_if_accounts_are_in_database(account.usernameDocumentElements, account.descriptionDocumentElements);
			account.usernameDocumentElements = checkedAccounts.usernames;
			account.descriptionDocumentElements = checkedAccounts.descriptions;
			pink_all(account.usernameDocumentElements, "deeppink");
			pink_all(account.descriptionDocumentElements, "hotpink");
		}
	}

	// Begin pinking in the distints contexts
	searchBox_context();
	sidebar_context();
	follow_context();
	//popup_account_to_pink();
}


/** Checks if the profile is in the local database **/
async function check_if_profile_is_in_database(username){
	let acDatabase = await usernames_of_database_as_array();
	console.log(acDatabase);
	console.log("Result:",acDatabase.includes(username));
	return (acDatabase.includes(username));
}

/** Checks if some of the ig_accounts are in the database **/
async function check_if_accounts_are_in_database(usernames, descriptions) {
	/*acDatabase = [
			  "el_baul_de_asmodeo",
			  "damazo108",
			  "decumentos",
			  "laquintadellobo",
			  "tierradenadie_2002",
			  "uraaaaaaj",
			  "panchito.sky.2493",
			  "aamaraa.a",
			  "koladenaranja",
			  "srta.fca",
			  "villacuma",
			  "pikozis"
	];*/

	// Takes usernames of localdatabase
	let acDatabase = await usernames_of_database_as_array();

	//console.log("Antes del filtro:",usernames);
	//console.log(descriptions);

	// Filters elements that isn't in the database
	accountsMarked = [...usernames].map(username => acDatabase.includes(username.innerText));
	usernames = [...usernames].filter((e,i) => accountsMarked[i]);
	descriptions = [...descriptions].filter((e,i) => accountsMarked[i]);
	//console.log("Después del filtro:",usernames);
	return {
		usernames: usernames,
	    descriptions: descriptions
		}
}

/** Returns local database usernames as an array */
async function usernames_of_database_as_array(){
	let acDatabase = (await browser.storage.local.get("database")).database;
	acDatabase = acDatabase.map(cell => cell.ig_account);
	//console.log("Base de datos",acDatabase);
	return acDatabase;
}

/** Paint elements to pink **/
function pink_all(element,pink){
	pink_unpink_all(element,pink);
}

/** Unpaint pinked elements **/
function unpink_all(element){
	pink_unpink_all(element, "unpinked");
}


/** Paint elements to pink **/
function pink_unpink_all(element, pink) {
	console.log(element,pink);
	let elements, type;
	type = Object.prototype.toString.call(element);
	if (type === "[object Array]") { 
		elements = element;
	}
	else {
		elements = element.querySelectorAll("*");
	}

	if (pink !== "unpinked") {
		console.log(pink);
		elements.forEach(item =>{
			if(!(item.style.color === pink)){
				item.style.color = pink;
				console.log("Color:",item.style.color);
			}
		})
	}
	else {
		console.log(pink);
		elements.forEach(item =>{
		console.log("Item to unpink:", item);
		item.style.removeProperty("color");
		})
	}
}


/** Execute code when some change in the content of the webpage **/
const webPage = document;
let pageObserver = new MutationObserver(webPage_changes);

pageObserver.observe(webPage, {
  attributes: true,
  childList: true,
  characterData: true,
  subtree: true,
  run_at: 'document_idle'
});

function webPage_changes(mutations) {
	console.log("Mutation");
	marked_users_to_pink();
}