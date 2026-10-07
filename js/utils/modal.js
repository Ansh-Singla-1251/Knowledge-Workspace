let resolver = null;

const backdrop =
    document.getElementById("modalBackdrop");

const modal =
    document.getElementById("modal");

const title =
    document.getElementById("modalTitle");

const description =
    document.getElementById("modalDescription");

const input =
    document.getElementById("modalInput");

const confirmButton =
    document.getElementById("modalConfirm");

const cancelButton =
    document.getElementById("modalCancel");

const closeButton =
    document.getElementById("modalClose");


function closeModal(value = null){

    if(!backdrop){
        return;
    }

    backdrop.classList.remove("visible");

    const currentResolver =
        resolver;

    resolver = null;

    setTimeout(() => {

        if(currentResolver){
            currentResolver(value);
        }

    },200);

}


function openModal({
    titleText,
    descriptionText = "",
    value = "",
    confirmText = "Confirm",
    danger = false
}){

    if(
        !backdrop ||
        !modal ||
        !title ||
        !description ||
        !input ||
        !confirmButton
    ){
        return Promise.resolve(null);
    }

    input.style.display = "";

    title.textContent =
        titleText;

    description.textContent =
        descriptionText;

    input.value =
        value;

    confirmButton.textContent =
        confirmText;

    modal.classList.toggle(
        "modal-danger",
        danger
    );

    confirmButton.classList.toggle(
        "modal-btn-danger",
        danger
    );

    confirmButton.classList.toggle(
        "modal-btn-primary",
        !danger
    );

    backdrop.classList.add(
        "visible"
    );

    setTimeout(() => {

        input.focus();
        input.select();

    },50);

    return new Promise(resolve => {

        resolver = resolve;

    });

}


export function requestInput(options){

    return openModal(options);

}


export function requestConfirmation(options){

    if(
        !backdrop ||
        !modal ||
        !title ||
        !description ||
        !input ||
        !confirmButton
    ){
        return Promise.resolve(false);
    }

    input.value = "";
    input.style.display = "none";

    title.textContent =
        options.titleText;

    description.textContent =
        options.descriptionText || "";

    confirmButton.textContent =
        options.confirmText || "Delete";

    confirmButton.classList.remove(
        "modal-btn-primary"
    );

    confirmButton.classList.add(
        "modal-btn-danger"
    );

    modal.classList.add(
        "modal-danger"
    );

    backdrop.classList.add(
        "visible"
    );

    return new Promise(resolve => {

        resolver = resolve;

    });

}


export function resetModalInput(){

    if(!input){
        return;
    }

    input.style.display = "";

}


if(confirmButton){
    confirmButton.addEventListener(
        "click",
        () => {

            if(input.style.display === "none"){

                closeModal(true);

                return;
            }

            const value =
                input.value.trim();

            if(!value){

                input.focus();

                return;
            }

            closeModal(value);

        }
    );
}


if(cancelButton){
    cancelButton.addEventListener(
        "click",
        () => {

            input.style.display = "";

            closeModal(null);

        }
    );
}


if(closeButton){
    closeButton.addEventListener(
        "click",
        () => {

            input.style.display = "";

            closeModal(null);

        }
    );
}


if(backdrop){
    backdrop.addEventListener(
        "click",
        event => {

            if(event.target !== backdrop){
                return;
            }

            input.style.display = "";

            closeModal(null);

        }
    );
}


if(input){
    input.addEventListener(
        "keydown",
        event => {

            if(event.key === "Enter"){
                confirmButton.click();
            }

            if(event.key === "Escape"){
                closeModal(null);
            }

        }
    );
}