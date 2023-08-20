'use strict'

/* Define Elements */
const navButtons = document.querySelectorAll(".nav-link");
const allButton = document.getElementById("all-button");
const marklistButton = document.getElementById("marklist-button");
const watchlistButton = document.getElementById("watchlist-button");
const accountsCardsBox = document.querySelector(".account-list");


/* Add triggers */
allButton.addEventListener("click", (event) => {show_hide_accounts("all",event.target)});
marklistButton.addEventListener("click", (event) => {show_hide_accounts("marklist",event.target)});
watchlistButton.addEventListener("click", (event) => {show_hide_accounts("watchlist",event.target)});

/* Main flow */
(async () => {
	// Append Marked Accounts
	await append_accounts();
	// Append message when accounts aren't marked
	noMarkedAccountMsg = // Message if it isn't marked accounts
	`<div class="no-marked-account-msg">
		<span>There aren't accounts marked...</span>
	</div>`;
	no_marked_accounts_msg();
	navButtons.forEach(button => button.addEventListener("click",no_marked_accounts_msg));
})()

/* Card entries of accounts */
function card_entry(markedAccount){
	let markType;
	switch (markedAccount.marked){
		case 0:
			markType = "marklist";
			break;
		case 1:
			markType = "watchlist";
			break;
	}
	const usernameWidth = measureText(markedAccount.ig_account,16); // Calculate width of the text
	return `
	<div class="account card ${markType}">
		<a href="https://www.instagram.com/${markedAccount.ig_account}" target="_blank" draggable="false">
			<div${usernameWidth > 150 ? " style=\"height:140px\"" : ""  }><img id="img1" src="resources/${markType == "marklist" ? "user-pink.png" : "user-purple.png"}" alt="Profile 1" draggable="false" id="img1"></div>
			<span>${markedAccount.ig_account}</span>
		</a>
	</div>
	`
}

/* Get db accounts */
async function append_accounts() {
	const markedAccounts = (await browser.storage.local.get('database')).database;
	console.log("append_accounts: List of the accounts in the database: ",markedAccounts);
	markedAccounts.forEach(markedAccount => {
		accountsCardsBox.innerHTML += card_entry(markedAccount);
	});
}


/* Show and hide accounts */
function show_hide_accounts(list,target){
	const accountCards = document.querySelectorAll(".account.card");
	navButtons.forEach(navButton => {navButton.classList.remove("active")});
	target.classList.add("active");
	if (list == "all"){
		accountCards.forEach(accountCard => {accountCard.classList.remove("hide")});
		return false;
	} else {
		accountCards.forEach(accountCard => {
			if (!accountCard.classList.contains(list)){
				accountCard.classList.add("hide");
			}
			else {
				accountCard.classList.remove("hide");
			}
		})
	}
}

/* Message when aren't marked accounts */
function no_marked_accounts_msg(){
	const main = accountsCardsBox.parentNode;
	const accountsCardsBoxCheck1 = accountsCardsBox.children.length == 0;
	const accountsCardsBoxCheck2 = Array.from(accountsCardsBox.children).every(card => card.classList.contains("hide"));
	if (accountsCardsBoxCheck1 || accountsCardsBoxCheck2 ){
		console.log("no_marked_accounts_msg: Without Accounts");
		if (main.innerHTML.includes(noMarkedAccountMsg)) return false;
	}
	if (accountsCardsBoxCheck1){
		main.insertAdjacentHTML("beforeend",noMarkedAccountMsg);
	} else if (accountsCardsBoxCheck2) {
			main.insertAdjacentHTML("beforeend",noMarkedAccountMsg);
			const noMarkedAccountMsgElement = main.querySelector(".no-marked-account-msg");
			noMarkedAccountMsgElement.classList.add("hide");
			setTimeout(() => {noMarkedAccountMsgElement.classList.remove("hide")},0);
	} else {
		const noMarkedAccountMsgElement = main.querySelector(".no-marked-account-msg");
		if (noMarkedAccountMsgElement) noMarkedAccountMsgElement.remove();
	}
}

/* Measure width of text */
function measureText(str, fontSize) {
	const widths = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.2796875,0.2765625,0.3546875,0.5546875,0.5546875,0.8890625,0.665625,0.190625,0.3328125,0.3328125,0.3890625,0.5828125,0.2765625,0.3328125,0.2765625,0.3015625,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.2765625,0.2765625,0.584375,0.5828125,0.584375,0.5546875,1.0140625,0.665625,0.665625,0.721875,0.721875,0.665625,0.609375,0.7765625,0.721875,0.2765625,0.5,0.665625,0.5546875,0.8328125,0.721875,0.7765625,0.665625,0.7765625,0.721875,0.665625,0.609375,0.721875,0.665625,0.94375,0.665625,0.665625,0.609375,0.2765625,0.3546875,0.2765625,0.4765625,0.5546875,0.3328125,0.5546875,0.5546875,0.5,0.5546875,0.5546875,0.2765625,0.5546875,0.5546875,0.221875,0.240625,0.5,0.221875,0.8328125,0.5546875,0.5546875,0.5546875,0.5546875,0.3328125,0.5,0.2765625,0.5546875,0.5,0.721875,0.5,0.5,0.5,0.3546875,0.259375,0.353125,0.5890625];
  	const avg = 0.5279276315789471;
	return Array.from(str).reduce(
	  (acc, cur) => acc + (widths[cur.charCodeAt(0)] ?? avg), 0
	) * fontSize
  }