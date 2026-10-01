import state from "../state/store.js";
import {openDatabase,loadState} from "../storage/database.js";
import {persistState} from "../storage/storage.js";

const documentTitle = document.getElementById("documentTitle");
const editorBlocks = document.getElementById("editorBlocks");
const addBlockBtn = document.getElementById("addBlockBtn");
const blockMenu = document.getElementById("blockMenu");
const saveIndicator = document.getElementById("saveIndicator");

let saveTimer = null;

const params = new URLSearchParams(window.location.search);
const documentId = params.get("id");

let currentDocument = null;

async function initializeEditor(){
    try{
        await openDatabase();

        const savedState = await loadState();

        state.workspaces = savedState.workspaces;
        state.folders = savedState.folders;
        state.documents = savedState.documents;

        currentDocument = state.documents.find(
            doc => doc.id === documentId
        );

        if(!currentDocument){
            documentTitle.value = "Document not found";
            saveIndicator.textContent = "Error";
            return;
        }

        state.currentDocumentId = documentId;

        loadDocument(currentDocument);

    }catch(error){
        console.error("Failed to initialize editor:",error);
        documentTitle.value = "Unable to load document";
        saveIndicator.textContent = "Error";
    }
}

initializeEditor();


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
            false,
            block.id
        );
    });
}


/* Create block */

function createBlock(type,content = "",focus = true,id = null){
    const block = document.createElement("div");

    block.className = `editor-block ${type}`;
    block.dataset.id =
        id ||
        `block-${Date.now()}-${Math.random().toString(36).substring(2,8)}`;

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
        autoResize(textarea);
        markUnsaved();
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

            markUnsaved();

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
    textarea.style.height = `${textarea.scrollHeight}px`;
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

    markUnsaved();
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
});


/* Unsaved state */

function markUnsaved(){
    if(!currentDocument){
        return;
    }

    saveIndicator.textContent = "Saving...";
    saveIndicator.classList.remove("saved");
    saveIndicator.classList.add("saving");

    clearTimeout(saveTimer);

    saveTimer = setTimeout(() => {
        saveDocument();
    },500);
}


/* Save document */

async function saveDocument(){
    if(!currentDocument){
        return;
    }

    currentDocument.title =
        documentTitle.value.trim() || "Untitled document";

    currentDocument.blocks =
        [...editorBlocks.children].map(block => ({
            id: block.dataset.id,
            type: getBlockType(block),
            content: block.querySelector("textarea").value
        }));

    currentDocument.updatedAt = new Date();

    try{
        await persistState();

        saveIndicator.textContent = "Saved";
        saveIndicator.classList.remove("saving");
        saveIndicator.classList.add("saved");
    }catch(error){
        console.error("Failed to save document:",error);

        saveIndicator.textContent = "Save failed";
        saveIndicator.classList.remove("saving");
    }
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