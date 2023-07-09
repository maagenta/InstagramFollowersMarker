/** Object initialization **/
markColor = {
	watchlist1 : "purple",
	watchlist2 : "MediumPurple",
	marklist1 : "deeppink",
	marklist2 : "hotpink"
};
profile = new profile();
markButton = new mark_button(); // Markbutton in needs to be declared before
mutationObserver = new mutation_observer();

/** Receives external messages **/
browser.runtime.onMessage.addListener((msg) => {
	if('url_changed' in msg){
		console.log("The URL has changed, and the message from background has been received");
		/* Sets profile elements when url is changed
		   This  is  important, because the mutation
		   observer  don't do that if it was visited 
		   a profile before.                      */
		profile.set_profile_elements();
	}
});

/** Execute code when some change in the content of the webpage **/
function mutation_observer() {
	this.webPage = document;
	this.pageObserver = new MutationObserver(webPage_changes);
	this.pageObserver.observe(this.webPage, {
	  attributes: true, childList: true,
	  characterData: true, subtree: true,
	  run_at: 'document_idle'
	});

	function webPage_changes(mutations) {
		console.log("Mutation");
		profile.execute();
		marked_users_to_pink();
	}

}

/** Sends messages **/
function background_do_action(action) {
	browser.runtime.sendMessage(action);
}



/** Profile Context **/
function profile() {

	/* Set profile elements that will be pinked */
	this.set_profile_elements = () => {
		console.log("Setting profile elements...");
		//Elements that are pinked when there are marked
		this.user = document.querySelector(".x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.x1ms8i2q.xo1l8bm.x5n08af.x10wh9bi.x1wdrske.x8viiok.x18hxmgj");
		this.userDetails_1 = document.querySelector(".x78zum5.x1q0g3np.xieb3on");
		this.userDetails_2 = document.querySelector("._aa_c");
		this.userStories = document.querySelector("._ab05");
		if(this.user) this.accountUsername = this.user.innerText;
		this.databaseEntry, this.color;
		//console.log("Profile before profile elements were setted",this,this.user);
	}

	/* Execute code of profile context */
	this.execute = async () => {
		if (!check_if_profile_elements_was_setted()){
			console.log("Profile elements has been setted?",this.user);
			this.set_profile_elements();
			if (!check_if_its_a_profile_page()) return false;
			await get_username_in_db();
			set_profile_color();
			console.log("Profile->execute context: Profile db entry:", this.databaseEntry)
			this.pink_marked_profiles();
			markButton.append();
			//if(!this.databaseEntry) return false;
			
		}
	}

	/* Checks if profile elements was setted */
	const check_if_profile_elements_was_setted = () => {
		return this.user;
	}

	/* Check if it's in a profile page */
	const check_if_its_a_profile_page = () => {

		// Check if an element exist
		if(!this.user){
			return false;
		}
		else if (!this.userDetails_1){
			return false;
		}
		else if (!this.userDetails_2){
			return false;
		}

		return true;

	}

	/* Checks if the account in the profile page is in the database */
	const get_username_in_db = async () => {
		console.log("Profile->get_username_in_db context: username to entry in db:",this.accountUsername);
		this.databaseEntry = await check_if_profile_is_in_database(this.accountUsername,"marktype");
		console.log("Profile->get_username_in_db context: Database entry:",this.databaseEntry);
	}

	const set_profile_color = () => {
		switch (this.databaseEntry.marked) {
			default:
				this.color = undefined;
				break;
			case 0:
				this.color = "marklistColor";
				break;
			case 1:
				this.color = "watchlistColor"
				break;
		}
		console.log("The profile color is:",this.color);
	}

	/* Executed when object is instantiated */
	this.set_profile_elements(); // Sets profile elements when object is instantiated
	console.log("Profile before profile elements were setted",this.user)


	/* Pink profiles if it's marked when a profile page is charged */
	this.pink_marked_profiles = () => {

		// Check if the Profile is in database
		if(!(this.databaseEntry)){ 
			console.log("The if statment works?")
			
		}
		// Check if profile's text is already pinked
		else if (this.user.style.color == markColor.marklist1 ||  this.user.style.color == markColor.watchlist1){
			return false;
		}

		this.pink_unpink_profiles();

	}

	/** Account Username/Description/Stories with pink color **/
	this.pink_unpink_profiles = () => {

		console.log("profile->pink_unpink_profiles: The profile object:",this);

		// Paint or unpaint elements. Paint by default or according to when Mark button is pressed
		switch (this.color) {
			case "marklistColor": case "watchlistColor":
				paint_elements(this);
				break;
			default:
				unpaint_elements(this);
				break;
		}

		function paint_elements(self) {
			console.log("Color to be painted profile text:",self.color);
			let markColor1, markColor2;
			switch (self.color){
				case "marklistColor":
					markColor1 = markColor.marklist1;
					markColor2 = markColor.marklist2;
					break;
				case "watchlistColor":
					markColor1 = markColor.watchlist1;
					markColor2 = markColor.watchlist2;
					break;
			}
			self.user.style.color = markColor1;
			pink_all(self.userDetails_1, markColor2);
			pink_all(self.userDetails_2, markColor2);
			if(self.userStories) pink_all(self.userStories, markColor1);
		}

		function unpaint_elements(self){
			console.log("Profile->unpaint_elements context: Unpainting elements");
			self.user.style.removeProperty("color");
			console.log("Unpainted?");
			unpink_all(self.userDetails_1);
			unpink_all(self.userDetails_2);
			if(self.userStories) unpink_all(self.userStories);
		}
	}
}



/** Mark/unmark button **/
function mark_button() {

	// Appends markButton
	this.append = async () => {
		console.log("Append Mark Button begging comprobing if its exist.");

		// Conditionals if not in a profile account
		if (document.querySelector('.ifm_buttonMarker')) {
		    return false;
		}
		
		console.log("Appending Mark Button...");

		this.divContainer = document.querySelector(".x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1n2onr6.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1");
		this.buttonDiv0 = document.createElement("div");
		this.buttonButton = document.createElement("button");
		this.buttonDiv1 = document.createElement("div");
		this.buttonDiv2 = document.createElement("div");

		this.buttonDiv0.className = "_ab8w  _ab94 _ab99 _ab9f _ab9m _ab9o  _abb0 _abcm";
		this.buttonButton.className = "_acan _acap _acas _aj1- ifm_buttonMarker";
		this.buttonButton.type = "button";
		this.buttonDiv1.className = "_ab8w._ab94 _ab97 _ab9h _ab9k _ab9p _ab9x _abcm";
		this.buttonDiv1.style.height = "100%";
		this.buttonDiv2.className = "_aacl _aaco _aacw _aad6 _aade";
		this.clickAction;
		add_click_event();

		const ctrlActive = true; //Temporal

		console.log("Type of marked list readed:",profile.databaseEntry);


		switch (profile.databaseEntry.marked) {
			default:
				console.log("Markbutton action: undefined");
				state("markMarklist");
				break;
			case 0:
				state("unmarkMarklist");
				break;
			case 1:
				state("unmarkWatchlist");
				break;
		}

		console.log("value of clickAction",this.clickAction);

		this.buttonDiv1.appendChild(this.buttonDiv2);
		this.buttonButton.appendChild(this.buttonDiv1);
		this.buttonDiv0.appendChild(this.buttonButton);
		this.divContainer.children[0].after(this.buttonDiv0);

	}

	// Adds click event
	const add_click_event = () => {
		this.buttonButton.addEventListener("click", mark_unmark_account);
	}

	// Adds the capability for adding to watchlist with ctrl+click
	const add_ctrl_event = () => {
		document.addEventListener("keydown", ctrlkey_action);
		document.addEventListener("keyup", ctrlkey_action);
	}

	const remove_ctrl_event = () => {
		document.removeEventListener("keydown", ctrlkey_action);
		document.removeEventListener("keyup", ctrlkey_action);
	}

	const ctrlkey_action = (key) => {
		if(key.key == "Control"){
			if (key.type == "keydown"){
				this.buttonButton.style.background = markColor.watchlist1;
				this.clickAction = "markWatchlist";
			}
			else {
				this.buttonButton.style.background = markColor.marklist1;
				this.clickAction = "markMarklist";
			}
		}
	}

		// Mark or unmark an profile account (markButton action)
	const mark_unmark_account = () => {
		let listType;
		console.log("Begins action of mark/unmark button with the follow listType",this.clickAction);
	
		switch (this.clickAction) {
			case "unmark": // When is in unmark mode
				console.log("Doing unmarking action");
				profile.color = undefined;
				unmark_account();
				state("markMarklist");
				break;
			case "markMarklist":
				listType = 0;
				console.log("Doing marking action (listType is 0)");
				profile.color = "marklistColor";
				mark_account(listType);
				state("unmarkMarklist");
				break;
			case "markWatchlist":
				listType = 1;
				console.log("Doing marking action (listType is 1)");
				profile.color = "watchlistColor";
				mark_account(listType);
				state("unmarkWatchlist");
				break;
		}

		function mark_account(listType){
			console.log("Button in markmode pressed with the follow account username and lisType:", profile.accountUsername, listType);
			background_do_action({action: "mark-account", account: profile.accountUsername, markedList: listType});
			console.log("Marked User:",profile.accountUsername);
			profile.pink_unpink_profiles();
		}

		function unmark_account(){
			console.log("Button in Unmark-mode pressed with the follow account username:", profile.accountUsername);
			background_do_action({action: "unmark-account", account: profile.accountUsername});
			console.log("Marked User:",profile.accountUsername);
			profile.pink_unpink_profiles();
		}
	}

	// Changes state of button
	const state = (buttonState) => {

		this.markText = "Mark";
		this.unmarkText = "Unmark";


		// States are unmarkMarklist, unmarkWatchlist, markMarklist, markWatchlist
		switch (buttonState) { 
			// unmark states
			case "unmarkMarklist": case "unmarkWatchlist":
				console.log("Button in",buttonState,"but for now passing in unmark mode");
				this.buttonDiv2.textContent = this.unmarkText;
				this.clickAction = "unmark";
				remove_ctrl_event();
				switch (buttonState){
					case "unmarkMarklist":
						console.log("Button in unmarkMarklist mode");
						this.buttonButton.style.background = markColor.marklist1;
						break;
					case "unmarkWatchlist":
						console.log("Button in unmarkWatchlist mode");
						this.buttonButton.style.background = markColor.watchlist1;
						break;
				}
				break;
			// mark states
		 	case "markMarklist": case "markWatchlist":
				console.log("Button in marklist mode");
		 		this.buttonDiv2.textContent = this.markText;
				switch (buttonState){
					case "markMarklist":
						console.log("Button in markMarklist mode");
						add_ctrl_event();
				 		this.buttonButton.style.background = markColor.marklist1;
				 		this.clickAction = "markMarklist";
					break;
					case "markWatchlist":
						console.log("Button in markWatchlist mode");
						this.buttonButton.style.background = markColor.watchlist1;
						this.clickAction = "markWatchlist";
					break;
				}
		 		break;
		}

		console.log("State of buttonAction after state funtion execution:",this.clickAction);
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
			pink_all(account.usernameDocumentElements, markColor.marklist1);
			pink_all(account.descriptionDocumentElements, markColor.marklist1);
		}
	}

	// Begin pinking in the distints contexts
	searchBox_context();
	sidebar_context();
	follow_context();
	//popup_account_to_pink();
}


/** Checks if the profile is in the local database **/
async function check_if_profile_is_in_database(username,marktype){
	marktype = "marktype";
	switch (marktype) {
		default:
			return only_profiles(username);
			break;
		case "marktype":
			return profiles_with_marktype(username);
			break;
	}

	async function only_profiles(username) {
		let acDatabase = await usernames_of_database_as_array();
		console.log("Is the profile in database? Database response:", acDatabase);
		const result = acDatabase.includes(username);
		console.log("After checking if account is in the db, finding only profile:", result);
		return (result);
	}

	async function profiles_with_marktype(username) {
		let acDatabase = await usernames_of_database_as_array("marktype");
		console.log("Is the profile in database? Database response:", acDatabase);
		var result = acDatabase.find(usrnme => usrnme.ig_account == username);
		console.log("After checking if account is in the db, finding profile and marktype:",result);

		if (!result) return false;
		return (result);
	}

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
async function usernames_of_database_as_array(marktype){
	console.log("Begin extracting database usernames");
	let acDatabase = await browser.storage.local.get("database");
	acDatabase = {...acDatabase}.database;
	console.log("Database extracted from local storage:",acDatabase);

	switch (marktype) {
		default:
			acDatabase = acDatabase.map(cell => cell.ig_account);
			break;
		case "marktype":
			console.log("Entered in marktype, so it will be an array of objects")
			break;
	}

	//console.log("Database as an array:",acDatabase);
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