/** Object initialization **/
markColor = {
	watchlist1 : "purple",
	watchlist2 : "MediumPurple",
	marklist1 : "deeppink",
	marklist2 : "hotpink"
};
let userPrefs, oldUserPrefs;
(async()=>{
	userPrefs = await get_userPrefs();
	const mutationObserver = new mutation_observer();
})()
const profile = new Profile();
const markButton = new MarkButton(); // Markbutton in needs to be declared before

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
	if('userPrefs_changed' in msg){
		user_preference_changed();
	}
	console.log("message received",msg);
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

	async function webPage_changes(mutations) {
		console.log("Mutation");
		profile.execute();
		if(userPrefs["highlightMarkedProfiles"])
			marked_users_to_pink();
		//profile_picture();
	}

}

/** Defines userPrefs **/
async function get_userPrefs(){
	const usPrf = (await browser.storage.local.get("userPrefs")).userPrefs;
	console.log("userPrefscheck",usPrf)
	return usPrf;
}

/** Run when a preference changed **/
async function user_preference_changed(){
	oldUserPrefs = userPrefs;
	userPrefs = await get_userPrefs();
	profile.userPrefsChanged();
}

/** Sends messages **/
function background_do_action(action) {
	browser.runtime.sendMessage(action);
}


/** Profile Context **/
function Profile() {

	/* Set profile elements that will be pinked */
	this.set_profile_elements = () => {
		console.log("Setting profile elements...");
		//Elements that are pinked when there are marked
		this.user = document.querySelector(".x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.x1ms8i2q.xo1l8bm.x5n08af.x10wh9bi.x1wdrske.x8viiok.x18hxmgj");
		this.userDetails_1 = document.querySelector(".x78zum5.x1q0g3np.xieb3on");
		this.userDetails_2 = document.querySelector(".x7a106z.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x78zum5.xdt5ytf.x2lah0s.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x11njtxf.xwonja6.x1dyjupv.x1onnzdu.xwrz0qm.xgmu61r.x1nbz2ho.xbjc6do");
		this.userStories = document.querySelector("._aao_");
		if(this.user) this.accountUsername = this.user.innerText;
		this.databaseEntry, this.color;
		console.log("Profile before profile elements were setted",this,this.user);
	}

	/* Execute code of profile context */
	this.execute = async (...arguments) => {
		const checkUserPrefsChanged = arguments[0] == "userPrefs-changed";
		if (!check_if_profile_elements_was_setted() || checkUserPrefsChanged){
			console.log("Profile elements has been setted?",this.user);
			this.set_profile_elements();
			if (!check_if_its_a_profile_page()) return false;
			await get_username_in_db();
			if(userPrefs["highlightMarkedProfiles"])
				set_profile_color();
			console.log("Profile->execute context: Profile db entry:", this.databaseEntry)
			this.pink_marked_profiles();
			if(userPrefs["showButtonMarker"])
				markButton.append();
		}
	}

	/* Run when a user preference was changed */
	this.userPrefsChanged = async () => {
		console.log("userPrefsChanged: Old user preferences:",oldUserPrefs);
		let prefSelector = pref_select();
		console.log("userPrefsChanged: userPrefsChanged: changing",userPrefs);
		console.log("userPrefsChanged: prefSelector",prefSelector);
		switch(prefSelector){
			case "hide-button":
				markButton.remove();
				break;
			case "show-button":
				markButton.append();
				break;
			case "unhighlight-profiles":
				profile.color = undefined;
				profile.pink_unpink_profiles();
				break;
			case "highlight-profiles":
				profile.execute("userPrefs-changed");
				break;
			case "disable-ctrlKey":
				markButton.remove_ctrl_event();
				break;
			case "enable-ctrlKey":
				markButton.add_ctrl_event();
				break;
		}

		function pref_select(){
			const prefs = [
				"hide-button",
				"show-button",
				"unhighlight-profiles",
				"highlight-profiles",
				"disable-ctrlKey",
				"enable-ctrlKey"
			]
			const userPrefsChanged = Object.values(userPrefs).map((value, index) => {
				if(value ^ Object.values(oldUserPrefs)[index]) return true;
				else return false;
			})
			console.log(userPrefsChanged);
			let selector;
			Object.entries(userPrefs).forEach(([key, value], index) => {
				if(userPrefsChanged[index]){
					selector = 2 * index + value;
				}
			})
			return prefs[selector];
		}
	}

	/* Checks if profile elements was setted */
	const check_if_profile_elements_was_setted = () => {
		if (this.user)
			return true;
		else
			return false;
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
function MarkButton() {

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

	// Remove markButton
	this.remove = () => {
		this.buttonDiv0.remove();
	}

	// Adds click event
	const add_click_event = () => {
		this.buttonButton.addEventListener("click", mark_unmark_account);
	}

	// Adds the capability for adding to watchlist with ctrl+click
	this.add_ctrl_event = () => {
		document.addEventListener("keydown", ctrlkey_action);
		document.addEventListener("keyup", ctrlkey_action);
	}

	this.remove_ctrl_event = () => {
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
				this.remove_ctrl_event();
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
						if(userPrefs["ctrlClick"])
							this.add_ctrl_event();
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


/** In the account list, marked accounts to Pink **/
function marked_users_to_pink() {

	// Begin pinking in the distints contexts
	searchBox_context();
	sidebar_context();
	follow_context();
	popup_account_context();
	suggested_context();

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

	function suggested_context(){
		let account = {};
		account.context = "suggested";
		account.suggestedBox = ".x1qjc9v5.x9f619.x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.xdj266r.xkrivgy.xat24cr.x1gryazu.x10v308y.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x11njtxf.xh8yej3.xlue5dm.x1sj0e5j.x1v758hv.x2hwt.xkqow3a";
		account.userBox = ".x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1pi30zi.x1swvt13.xwib8y2.x1y1aw1k.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1";
		account.username = ".x9f619.xjbqb8w.x1rg5ohu.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1n2onr6.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x6s0dn4.x1oa3qoh.x1nhvcw1";
		account.description = ".x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xvs91rp.xo1l8bm.x1roi4f4.x10wh9bi.x1wdrske.x8viiok.x18hxmgj";
		account.description2 = true // It isn't necesary to determine because the second description is the nextSibling of the first description
		account.username = account.suggestedBox + " " + account.userBox + " " + account.username;
		account.description = account.suggestedBox + " " + account.userBox + " " + account.description;

		pink_accounts({...account});
	}

	function follow_context(){
		let account = {};
		account.context = "follow"; //only for debugging purposes
		account.followBox = ".x7r02ix.xf1ldfh.x131esax.xdajt7p.xxfnqb6.xb88tzc.xw2csxc.x1odjw0f.x5fp0pe";
		account.username = ".x9f619.xjbqb8w.x1rg5ohu.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1n2onr6.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x6s0dn4.x1oa3qoh.x1nhvcw1";
		account.description = ".x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xvs91rp.xo1l8bm.x1roi4f4.x10wh9bi.x1wdrske.x8viiok.x18hxmgj .x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft";
		account.username = account.followBox + " " + account.username;
		account.description = account.followBox + " " + account.description;

		pink_accounts({...account});
	}

	async function popup_account_context() {
		let account = {};
		account.context = "popup_account";
		account.popupBox = ".xvbhtw8.x1lq5wgf.xgqcy7u.x30kzoy.x9jhf4c.x1rj4ezl.x1n2onr6.xfr5jun.xexx8yu.x4uap5.x18d9i69.xkhd6sd";
		account.username = ".x6s0dn4.x78zum5.xmix8c7";
		account.userDetails_1 = ".xmix8c7.x1gslohp.x1rva8in";
		account.userDetails_2 = ".x6s0dn4.xrvj5dj.x8l38fb.x1rp53t7";
		account.username = document.querySelector(account.popupBox + " " + account.username);
		if(!account.username) return false;
		account.userDetails_1 = document.querySelector(account.popupBox + " " + account.userDetails_1);
		account.userDetails_2 = document.querySelector(account.popupBox + " " + account.userDetails_2);
		account.username.text = account.username.querySelector("a > span").innerText;

		const isPopupAccountInDatabase = await check_if_profile_is_in_database(account.username.text);
		console.log("popup_account_context object:",account);
		console.log("popup_account checking if username is in the database:", isPopupAccountInDatabase);

		let markColor1, markColor2;
		switch(isPopupAccountInDatabase.marked){
			default:
				return false;
			case 0:
				markColor1 = markColor.marklist1;
				markColor2 = markColor.marklist2;
				break;
			case 1:
				markColor1 = markColor.watchlist1;
				markColor2 = markColor.watchlist2;
				break;
		}

		pink_all(account.username, markColor1);
		pink_all(account.userDetails_1, markColor2);
		pink_all(account.userDetails_2, markColor2);
	}

	async function pink_accounts(account){
		account.usernameDocumentElements = document.querySelectorAll(account.username);
		account.descriptionDocumentElements = document.querySelectorAll(account.description);
		//if(account.context == "sidebar") console.log("Description to pink:", account);

		if(!account.usernameDocumentElements[0]) return false;

		checkedAccounts = await check_if_accounts_are_in_database(account.usernameDocumentElements, account.descriptionDocumentElements);
		account.usernameDocumentElements = checkedAccounts.usernames;
		account.descriptionDocumentElements = checkedAccounts.descriptions;
		account.markColors1 = mark_colors("markColor1");
		account.markColors2 = mark_colors("markColor2");

		function mark_colors(_markColor){
			console.log("markcolor one or two?",_markColor);
			console.log("markcolor checked accounts listType:",checkedAccounts.listTypes);
			entriesMarkColors = checkedAccounts.listTypes.map(
				listType => {
					let markColor1, markColor2;
					switch(`${listType} ${_markColor}`) {
						case '0 markColor1':
							return markColor.marklist1;
							break;
						case '0 markColor2':
							return markColor.marklist2;
							break;
						case '1 markColor1':
							return markColor.watchlist1;
							break;
						case '1 markColor2':
							return markColor.watchlist2;
							break;
					}
				})
			return entriesMarkColors;
		}

		console.log("pink_accounts: Checked accounts:",checkedAccounts);
		console.log("pink_accounts: Account elements color",account.markColors1,account.markColors2)
		pink_all(account.usernameDocumentElements, account.markColors1);
		pink_all(account.descriptionDocumentElements, account.markColors2);

		// Account description 2 is exclusive to the suggest list context,
		// the second description tell things like "Followed by xxx and yyy".
		if (account.description2){
			account.descriptionDocumentElements.forEach((element,index) => {
				pink_all(element.nextElementSibling, account.markColors2[index])
			})
		}
	}
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
		let acDatabase = await entries_of_database_as_array();
		console.log("Is the profile in database? Database response:", acDatabase);
		const result = acDatabase.includes(username);
		console.log("After checking if account is in the db, finding only profile:", result);
		return (result);
	}

	async function profiles_with_marktype(username) {
		let acDatabase = await entries_of_database_as_array("marktype");
		console.log("Is the profile in database? Database response:", acDatabase);
		var result = acDatabase.find(usrnme => usrnme.ig_account == username);
		console.log("After checking if account is in the db, finding profile and marktype:",result);

		if (!result) return false;
		return (result);
	}

}

/** Checks if some of the ig_accounts are in the database **/
async function check_if_accounts_are_in_database(usernames, descriptions) {
	// Takes usernames of localdatabase
	let database = await entries_of_database_as_array();
	let acDatabase = database.map(username => username.ig_account);
	let markedDatabase = database.map(username => username.marked);
	console.log("Antes del filtro:",usernames);
	console.log(descriptions);
	console.log("acDatabase:",acDatabase);
	console.log("markedDatabase:",markedDatabase);

	// Filters elements that isn't in the database
	accountsMarked = [...usernames].map(username => {
		foundAccount = acDatabase.indexOf(username.innerText);
		if (foundAccount == -1) return false;
		return foundAccount;
	}); //returns true or false for each element
	console.log("accountsMarked:",accountsMarked);
	usernames = [...usernames].filter(filter_elements);
	descriptions = [...descriptions].filter(filter_elements);
	accountsMarked = [...accountsMarked].filter(filter_elements);
	function filter_elements (e,i) {
		const check = typeof accountsMarked[i] === "number";
		return check;
	}
	listTypes = accountsMarked.map(i => markedDatabase[i]);
	return {
		usernames: usernames,
		descriptions: descriptions,
		listTypes: listTypes
		}
}

/** Returns local database usernames as an array */
async function entries_of_database_as_array(marktype){
	console.log("entries_of_database_as_array: Begin extracting database usernames");
	let acDatabase = (await browser.storage.local.get('database')).database;
	//acDatabase = {...acDatabase}.database;
	console.log("database as an array:", acDatabase.database);
	console.log("entries_of_database_as_array: Database extracted from local storage:",acDatabase);
	return acDatabase;
}
	


/** Paint elements to pink **/
function pink_all(elements,pink){
	pink_unpink_all(elements,pink);
}

/** Unpaint pinked elements **/
function unpink_all(elements){
	pink_unpink_all(elements, "unpinked");
}


/** Paint elements to pink **/
function pink_unpink_all(elements, pink) {

	console.log("pink_unpink_all element and color:",elements,pink);
	const type = Object.prototype.toString.call(elements)
	if (!(type === "[object Array]")) {
		elements = elements.querySelectorAll("*");
	}

	switch (pink){
		default:
			be_pink();
			break;
		case "unpinked":
			be_unpink();
			break;
	}

	function be_pink(){
		console.log("pink_unpink_all Colors to pink:",pink);
		if (typeof pink === "string"){
			elements.forEach( (item,index) =>{
				if(!(item.style.color == pink)){
					item.style.color = pink;
					console.log("pink_unpink_all Element pinked with color:",item.style.color);
				}
			})
		}
		else {
			elements.forEach( (item,index) =>{
				if(!(item.style.color === pink[index])){
					item.style.color = pink[index];
					console.log("pink_unpink_all Element pinked with color:",item.style.color);
				}
			})
		}
	}

	function be_unpink(){
		elements.forEach(item =>{
			console.log("Item to unpink:", item);
			item.style.removeProperty("color");
		})
	}

}

function profile_picture() {
	profileImage = document.querySelector("main .xpdipgo.x6umtig.x1b1mbwd.xaqea5y.xav7gou.xk390pu.x5yr21d.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x11njtxf.xh8yej3")
	profileImage.onload = function() {
		console.log("profile_picture: DOM Element catched when is profile image:",profileImage);
		var canvas = document.createElement('canvas');
		canvas.width = profileImage.width;
		canvas.height = profileImage.height;
		var ctx = canvas.getContext('2d');
		ctx.drawImage(profileImage, 0, 0);

		var base64Image = canvas.toDataURL();
		localStorage.setItem('imagen', base64Image);
		console.log('Imagen almacenada en el localStorage');
		console.log("La imagen es:",localStorage.getItem('imagen'));
		window.open(base64Image, '_blank');
	 }
}
