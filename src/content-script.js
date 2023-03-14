window.addEventListener("error", (event) => {
  console.log(event);
});



/** Receive external messages **/
browser.runtime.onMessage.addListener((msg) => {
	if('url_changed' in msg){
		//marked_users_to_pink();
		append_mark_button();
		mark_pink_profiles();	
	}
});

/** Send messages **/
function background_do_action(action) {
	switch (action.action){
		case "mark-account":
			browser.runtime.sendMessage(action);
	}
}


/** Appends the mark/unmark button **/
function append_mark_button() {

	// Conditionals if not in a profile account
	if (document.querySelector('._ifm')) {
	    return false;
	}
	else if (!document.querySelector("._ab8w._ab94._ab99._ab9f._ab9k._ab9p._abb3._abcm")) {
		return false;
	}

	let divContainer = document.querySelector("._ab8w._ab94._ab99._ab9f._ab9k._ab9p._abcm:not(._abb3)");
	let buttonDiv0 = document.createElement("div");
	let buttonButton = document.createElement("button");
	let buttonDiv1 = document.createElement("div");
	let buttonDiv2 = document.createElement("div");

	buttonDiv0.className = "_ab8w  _ab94 _ab99 _ab9f _ab9m _ab9o  _abb0 _abcm";
	buttonButton.className = "_acan _acap _acas _aj1- _ifm";
	buttonButton.type = "button";
	buttonButton.style.background = "deeppink";
	buttonDiv1.className = "_ab8w._ab94 _ab97 _ab9h _ab9k _ab9p _ab9x _abcm";
	buttonDiv1.style.height = "100%";
	buttonDiv2.className = "_aacl _aaco _aacw _aad6 _aade";
	buttonDiv2.textContent = "Marcar";

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

	// On click add the account to the database
	buttonButton.addEventListener("click", mark_account);
	let account = "kardashian";

	function mark_account(){
		console.log("Presionado");
		background_do_action({action: "mark-account", account: account, markedList: 1});
		buttonDiv2.textContent = "Desmarcar";
	}
}


/** Account Username/Description/Stories with pink color **/
function mark_pink_profiles() {

	//Elements to paint with pink
	const user = document.querySelector(".x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.x1ms8i2q.xo1l8bm.x5n08af.x10wh9bi.x1wdrske.x8viiok.x18hxmgj");
	const userDetails_1 = document.querySelector(".x78zum5.x1q0g3np.xieb3on");
	const userDetails_2 = document.querySelector("._aa_c");
	const userStories = document.querySelector("._ab05");

	// Check if an element exist
	if(!user){
		return false;
	}
	else if (!userDetails_1){
		return false;
	}
	else if (!userDetails_2){
		return false;

	}
	else if (user.style.color == "deeppink"){
		return false;
	}

	// Paint elements
	user.style.color = "deeppink"
	pink_all(userDetails_1, "hotpink");
	pink_all(userDetails_2, "hotpink");
	if(userStories) pink_all(userStories, "deeppink");

}

/** In the account list, marked accounts with Pink **/
function marked_users_to_pink() {
	let accountUsername = {}; let accountDescription = {};
	console.log(accountDescription);
	accountUsername.inFollowersFollowedList = "._ab8y._ab94._ab97._ab9f._ab9k._ab9p._abcm";
	accountDescription.inFollowersFollowedList = ".x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft";
	accountUsername.inSidebarList = "._ab8w._ab94._ab99._ab9f._ab9m._ab9p._abaj._aba_._abcm ._ab8y._ab94._ab97._ab9f._ab9k._ab9p._abcm";
	accountDescription.inSidebarList = ".x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.x1fhwpqd.xo1l8bm.x1roi4f4.x10wh9bi.x1wdrske.x8viiok.x18hxmgj .x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft";
	accountUsername.allElements = accountUsername.inFollowersFollowedList + ", " + accountUsername.inSidebarList;
	accountDescription.allElements = accountDescription.inFollowersFollowedList + ", " + accountDescription.inSidebarList;
	accountUsername.documentElements = document.querySelectorAll(accountUsername.allElements);
	accountDescription.documentElements = document.querySelectorAll(accountDescription.allElements);
	console.log(accountDescription.allElements);
	console.log(accountDescription.documentElements)
	console.log(accountUsername.documentElements);
/*	if(accountUsername.length === 0 || accountDescription.length === 0){
	}
	else{*/
		//console.log(accountDescription);
		pink_all(accountUsername.documentElements, "deeppink");
		pink_all(accountDescription.documentElements, "hotpink");
	/*}*/
}

/** To pink popup when put a username in list **/
function popup_account_to_pink() {
	const user = document.querySelector(".x6s0dn4.x78zum5.xmix8c7");
	const userDetails_1 = document.querySelector(".xmix8c7.x1gslohp.x1rva8in");
	const userDetails_2 = document.querySelector(".x6s0dn4.xrvj5dj.x8l38fb.x1rp53t7");

	pink_all(user, "deeppink");
	pink_all(userDetails_1, "hotpink");
	pink_all(userDetails_2, "hotpink");
}

/** Paint elements to pink **/
function pink_all(element, pink) {
	let elements, type;
	type = Object.prototype.toString.call(element);
	if(type === "[object NodeList]") { 
		elements = element;
	}
	else{
		elements = element.querySelectorAll("*");
	}
	elements.forEach(item =>{
		item.style.color = pink;
	})
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
	console.log("mutation");
	marked_users_to_pink();
	popup_account_to_pink();
}

// Execute script when is charged for first 
/*setTimeout(append_mark_button, 3000);
setTimeout(mark_pink_profiles, 3000);*/

/*let somesome = {aa: "aaa"};
browser.storage.local.set(somesome);
console.log(browser.storage.local.get(somesome));*/