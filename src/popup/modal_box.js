let modal, modalContent;
export function open(modalBox){
	document.body.insertAdjacentHTML("beforeend",modalBox);
	modal = document.querySelector(".modal");
	modalContent = modal.querySelector(".modal-content");
	modal.classList.add("opening");
	modalContent.classList.add("opening");
	modal.addEventListener("animationend", animation_remove);
	modalContent.addEventListener("animationend", animation_remove);
	const closeModalTrigger = document.querySelectorAll(".modal button, .modal");
	closeModalTrigger.forEach(closeModalTrigger => {closeModalTrigger.addEventListener("click", close)});
}

export let modalContext = modal;

function close(event){
	//console.log(event.target);
	//console.log(event.target.tagName)
	if (event.target.tagName == "BUTTON" || event.target.classList.contains("modal")){
		modal.classList.add("closing");
		modalContent.classList.add("closing");
		modal.addEventListener("animationend", animation_remove);
		modalContent.addEventListener("animationend", animation_remove);
		modal.addEventListener("animationend", remove);
		modalContent.addEventListener("animationend", remove);
		function remove (e){
			if(e.target.className != this.className) return false;
			modal.remove(); 
		}
	}
}

function animation_remove (e) {
	if(e.target.className != this.className) return false;
	this.classList.remove("opening");
	this.classList.remove("closing");
	this.removeEventListener("animationend",animation_remove);
}