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
	return `
	<div class="account card ${markType}">
		<a href="https://www.instagram.com/${markedAccount.ig_account}" target="_blank" draggable="false">
			<img id="img1" src="resources/user.jpg" alt="Profile 1" draggable="false" id="img1">
			<span class="username">${markedAccount.ig_account}</span>
		</a>
	</div>
	`
}

/* Get db accounts */
async function append_accounts() {
	markedAccounts = (await browser.storage.local.get('database')).database;
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