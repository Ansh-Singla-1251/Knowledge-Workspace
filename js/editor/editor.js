import state from "../state/store.js";

import {updateDocument} from "../document/document.js";


const documentTitle = document.getElementById("documentTitle");
const editorBlocks = document.getElementById("editorBlocks");
const addBlockBtn = document.getElementById("addBlockBtn");
const blockMenu = document.getElementById("blockMenu");
const saveIndicator = document.getElementById("saveIndicator");


const params = new URLSearchParams(window.location.search);
const documentId = params.get("id");


const currentDocument = state.documents.find(
    doc => doc.id === documentId
);


if(!currentDocument){

    documentTitle.value = "Document not found";
    saveIndicator.textContent = "Error";

}else{

    loadDocument(currentDocument);

}


/* Load document */

function loadDocument(doc){

    documentTitle.value = doc.title;
    editorBlocks.innerHTML = "";

    if(!doc.blocks || doc.blocks.length === 0){

        createBlock("paragraph");

        return;
    }

    doc.blocks.forEach(block => {

        createBlock(
            block.type,
            block.content,
            false
        );

    });

}


/* Create block */

function createBlock(type,content = "",focus = true){

    const block = document.createElement("div");

    block.className = `editor-block ${type}`;


    const textarea = document.createElement("textarea");

    textarea.rows = 1;
    textarea.value = content;


    if(type === "paragraph"){
        textarea.placeholder = "Start writing...";
    }

    if(type === "heading"){
        textarea.placeholder = "Section heading...";
    }

    if(type === "bullet"){
        textarea.placeholder = "List item...";
    }

    if(type === "code"){
        textarea.placeholder = "Write code...";
    }


    const controls = document.createElement("div");

    controls.className = "block-controls";


    controls.innerHTML = `

        <button
            type="button"
            class="block-control move-up"
            title="Move up"
        >
            ↑
        </button>

        <button
            type="button"
            class="block-control move-down"
            title="Move down"
        >
            ↓
        </button>

        <button
            type="button"
            class="block-control delete-block"
            title="Delete block"
        >
            ×
        </button>

    `;


    block.appendChild(textarea);
    block.appendChild(controls);


    editorBlocks.appendChild(block);


    autoResize(textarea);


    textarea.addEventListener("input",() => {

        
        markUnsaved();
        saveDocument();

    });


    textarea.addEventListener("keydown",event => {

        if(event.key === "Enter" && !event.shiftKey){

            event.preventDefault();

            const newBlock = createBlock(
                "paragraph",
                "",
                true
            );

            block.after(newBlock);

            return;
        }


        if(event.key === "Backspace" && textarea.value === ""){

            const previousBlock = block.previousElementSibling;

            if(!previousBlock){
                return;
            }

            event.preventDefault();

            const previousTextarea = previousBlock.querySelector(
                "textarea"
            );

            block.remove();

            if(previousTextarea){

                previousTextarea.focus();

                previousTextarea.selectionStart =
                    previousTextarea.value.length;

                previousTextarea.selectionEnd =
                    previousTextarea.value.length;

            }

            markUnsaved();

        }

    });


    const moveUp = controls.querySelector(".move-up");


    moveUp.addEventListener("click",() => {

        const previousBlock = block.previousElementSibling;

        if(!previousBlock){
            return;
        }

        editorBlocks.insertBefore(
            block,
            previousBlock
        );

        markUnsaved();

    });


    const moveDown = controls.querySelector(".move-down");


    moveDown.addEventListener("click",() => {

        const nextBlock = block.nextElementSibling;

        if(!nextBlock){
            return;
        }

        editorBlocks.insertBefore(
            nextBlock,
            block
        );

        markUnsaved();

    });


    const deleteButton = controls.querySelector(".delete-block");


    deleteButton.addEventListener("click",() => {

        const previousBlock = block.previousElementSibling;
        const nextBlock = block.nextElementSibling;

        block.remove();


        const focusTarget = previousBlock || nextBlock;


        if(focusTarget){

            const targetTextarea = focusTarget.querySelector(
                "textarea"
            );

            if(targetTextarea){
                targetTextarea.focus();
            }

        }

        markUnsaved();

    });


    if(focus){

        setTimeout(() => {
            textarea.focus();
        },0);

    }


    return block;

}


/* Resize textarea */

function autoResize(textarea){

    textarea.style.height = "auto";

    textarea.style.height =
        `${textarea.scrollHeight}px`;

}


/* Add block menu */

addBlockBtn.addEventListener("click",event => {

    event.stopPropagation();

    blockMenu.classList.toggle("visible");

});


blockMenu.addEventListener("click",event => {

    const button = event.target.closest("button");

    if(!button){
        return;
    }

    const type = button.dataset.blockType;

    createBlock(type);

    blockMenu.classList.remove("visible");

});


/* Close block menu */

document.addEventListener("click",event => {

    if(
        !blockMenu.contains(event.target) &&
        !addBlockBtn.contains(event.target)
    ){

        blockMenu.classList.remove("visible");

    }

});


/* Document title */

documentTitle.addEventListener("input",() => {

    markUnsaved();
    saveDocument();
});


/* Unsaved state */

function markUnsaved(){

    saveIndicator.textContent = "Unsaved";

    saveIndicator.classList.remove("saved");

    saveIndicator.classList.add("saving");

}


/* Save document */

function saveDocument(){

    if(!currentDocument){
        return;
    }


    const blocks = Array.from(
        editorBlocks.children
    ).map(blockElement => {

        const textarea = blockElement.querySelector(
            "textarea"
        );

        return {
            type: getBlockType(blockElement),
            content: textarea.value
        };

    });


    updateDocument(
        currentDocument.id,
        documentTitle.value.trim() || "Untitled document"
    );


    currentDocument.blocks = blocks;
    currentDocument.updatedAt = new Date();


    saveIndicator.textContent = "Saved";

    saveIndicator.classList.remove("saving");
    saveIndicator.classList.add("saved");

}


/* Get block type */

function getBlockType(blockElement){

    if(blockElement.classList.contains("heading")){
        return "heading";
    }

    if(blockElement.classList.contains("bullet")){
        return "bullet";
    }

    if(blockElement.classList.contains("code")){
        return "code";
    }

    return "paragraph";

}




console.log("Knowledge Workspace editor started!");