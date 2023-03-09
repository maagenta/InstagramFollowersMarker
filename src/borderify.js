// Receive external messages
browser.runtime.onMessage.addListener((msg) => {
	if('url_changed' in msg){
		marked_users_to_pink();
		append_mark_button();
		marked_pink();
		
	}
	return Promise.resolve({ response: "Received" });
});


//Appends the mark/unmark button
function append_mark_button() {
	if (document.querySelector('._ifm')) {
	    return false;
	}
	else if (!document.querySelector("._ab8w._ab94._ab99._ab9f._ab9k._ab9p._abb3._abcm")) {
		return false;
	}

	console.log("Mark Button Script Begins");
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
	buttonDiv2.textContent = "Desmarcar";

	buttonDiv1.appendChild(buttonDiv2);
	buttonButton.appendChild(buttonDiv1);
	buttonDiv0.appendChild(buttonButton);
	divContainer.children[0].after(buttonDiv0);
}


//Account Username/Description/Stories with pink color
function marked_pink() {

	//Elements to paint with pink
	const user = document.querySelector(".x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.x1ms8i2q.xo1l8bm.x5n08af.x10wh9bi.x1wdrske.x8viiok.x18hxmgj");
	const userDetails_1 = document.querySelector(".x78zum5.x1q0g3np.xieb3on");
	const userDetails_2 = document.querySelector("._aa_c");
	const userStories = document.querySelector("._ab05");

	// Paint elements
	user.style.color = "deeppink"
	pink_all(userDetails_1, "hotpink");
	pink_all(userDetails_2, "hotpink");
	pink_all(userStories, "deeppink");

}

// In the account list, marked accounts with Pink
function marked_users_to_pink() {
	let accountUsername = document.querySelectorAll('._ab8w._ab94._ab97._ab9f._ab9k._ab9p._ab9-._aba8._abcm ._ab8y._ab94._ab97._ab9f._ab9k._ab9p._abcm');
	let accountDescription = document.querySelectorAll('._ab8w._ab94._ab97._ab9f._ab9k._ab9p._ab9-._aba8._abcm ._aacl._aaco._aacu._aacy._aada');
	if(accountUsername.length === 0 || accountDescription.length === 0){
	}
	else{
		console.log(accountDescription);
		pink_all(accountUsername, "deeppink");
		pink_all(accountDescription, "hotpink");
	}
}

// To pink popup when put a username in list
function popup_account_to_pink() {
	const user = document.querySelector(".x6s0dn4.x78zum5.xmix8c7");
	const userDetails_1 = document.querySelector(".xmix8c7.x1gslohp.x1rva8in");
	const userDetails_2 = document.querySelector(".x6s0dn4.xrvj5dj.x8l38fb.x1rp53t7");

	pink_all(user, "deeppink");
	pink_all(userDetails_1, "hotpink");
	pink_all(userDetails_2, "hotpink");
}

// Paint elements to pink
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


// Execute code when some change in the content of the webpage
const webPageBody = document.querySelector('body');
const observer = new MutationObserver(webPage_changes);

observer.observe(webPageBody, {
  attributes: true,
  childList: true,
  characterData: true,
  subtree: true
});

function webPage_changes(mutations) {
	//mutations.forEach(mutation => {console.log(mutation);});
	marked_users_to_pink();
	popup_account_to_pink();
}

// Execute script when is charged for first 
/*setTimeout(append_mark_button, 3000);
setTimeout(marked_pink, 3000);*/

/*let somesome = {aa: "aaa"};
browser.storage.local.set(somesome);
console.log(browser.storage.local.get(somesome));*/