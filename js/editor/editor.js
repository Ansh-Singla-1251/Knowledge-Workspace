import state from "../state/store.js";
import {openDatabase,loadState} from "../storage/database.js";
import {linkDocuments,getBacklinks} from "../document/document.js";
import {requestInput,resetModalInput} from "../utils/modal.js";
import {persistState} from "../storage/storage.js";
import {createMindMapBlock} from "./mindmap.js";
import {
    searchWikipedia,
    getWikipediaSummary
} from "../wikipedia/wikipedia.js";

const documentTitle = document.getElementById("documentTitle");
const editorBlocks = document.getElementById("editorBlocks");
const addBlockBtn = document.getElementById("addBlockBtn");
const blockMenu = document.getElementById("blockMenu");
const saveIndicator = document.getElementById("saveIndicator");
const linkedDocuments = document.getElementById("linkedDocuments");
const backlinkDocuments = document.getElementById("backlinkDocuments");

const wikipediaToggle = document.getElementById("wikipediaToggle");
const wikipediaPanel = document.getElementById("wikipediaPanel");
const wikipediaClose = document.getElementById("wikipediaClose");
const wikipediaSearch = document.getElementById("wikipediaSearch");
const wikipediaSearchBtn = document.getElementById("wikipediaSearchBtn");
const wikipediaResults = document.getElementById("wikipediaResults");

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
        renderConnections();
    }catch(error){
        console.error("Failed to initialize editor:",error);
        documentTitle.value = "Unable to load document";
        saveIndicator.textContent = "Error";
    }
}

initializeEditor();


const linkDocumentBtn =
    document.getElementById("linkDocumentBtn");

linkDocumentBtn.addEventListener("click",async () => {
    if(!currentDocument){
        return;
    }

    const availableDocuments = state.documents.filter(
        document => document.id !== currentDocument.id
    );

    if(availableDocuments.length === 0){
        return;
    }

    const titles = availableDocuments
        .map(document => document.title)
        .join(", ");

    resetModalInput();

    const title = await requestInput({
        titleText:"Link document",
        descriptionText:`Available documents: ${titles}`,
        confirmText:"Link"
    });

    if(!title){
        return;
    }

    const targetDocument = availableDocuments.find(
        document =>
            document.title.toLowerCase() === title.toLowerCase()
    );

    if(!targetDocument){
        return;
    }

    linkDocuments(
        currentDocument.id,
        targetDocument.id
    );
});


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


function renderConnections(){
    linkedDocuments.innerHTML = "";
    backlinkDocuments.innerHTML = "";

    if(!currentDocument){
        return;
    }

    const links = currentDocument.links || [];

    if(links.length === 0){
        linkedDocuments.innerHTML =
            `<p class="connection-empty">No linked documents.</p>`;
    }else{
        links.forEach(documentId => {
            const linkedDocument = state.documents.find(
                item => item.id === documentId
            );

            if(!linkedDocument){
                return;
            }

            const wrapper = document.createElement("div");

            wrapper.className = "connection-item";

            wrapper.innerHTML = `
                <button
                    class="connection-document"
                    type="button"
                >
                    ${linkedDocument.title}
                </button>

                <button
                    class="remove-link-btn"
                    type="button"
                    title="Remove link"
                >
                    ×
                </button>
            `;

            wrapper
                .querySelector(".connection-document")
                .addEventListener("click",() => {
                    window.location.href =
                        `editor.html?id=${encodeURIComponent(linkedDocument.id)}`;
                });

            wrapper
                .querySelector(".remove-link-btn")
                .addEventListener("click",() => {
                    currentDocument.links =
                        currentDocument.links.filter(
                            id => id !== linkedDocument.id
                        );

                    currentDocument.updatedAt = new Date();

                    renderConnections();
                    persistState();
                });

            linkedDocuments.appendChild(wrapper);
        });
    }

    const backlinks = getBacklinks(currentDocument.id);

    if(backlinks.length === 0){
        backlinkDocuments.innerHTML =
            `<p class="connection-empty">No backlinks yet.</p>`;
    }else{
        backlinks.forEach(backlink => {
            const element = document.createElement("button");

            element.className = "connection-document";
            element.textContent = backlink.title;

            element.addEventListener("click",() => {
                window.location.href =
                    `editor.html?id=${encodeURIComponent(backlink.id)}`;
            });

            backlinkDocuments.appendChild(element);
        });
    }
}


function createBlock(type,content = "",focus = true,id = null){
    const block = document.createElement("div");

    block.className = `editor-block ${type}`;
    block.dataset.id =
        id ||
        `block-${Date.now()}-${Math.random().toString(36).substring(2,8)}`;

    if(type === "mindmap"){
        createMindMapBlock(block,content,markUnsaved);
        editorBlocks.appendChild(block);
        return block;
    }

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


function autoResize(textarea){
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
}


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


document.addEventListener("click",event => {
    if(
        !blockMenu.contains(event.target) &&
        !addBlockBtn.contains(event.target)
    ){
        blockMenu.classList.remove("visible");
    }
});


documentTitle.addEventListener("input",() => {
    markUnsaved();
});


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


async function saveDocument(){
    if(!currentDocument){
        return;
    }

    currentDocument.title =
        documentTitle.value.trim() || "Untitled document";

    currentDocument.blocks =
        [...editorBlocks.children].map(block => {

            if(block.classList.contains("mindmap")){
                return {
                    id: block.dataset.id,
                    type: "mindmap",
                    content: block.dataset.content || JSON.stringify({
                        nodes: [],
                        connections: []
                    })
                };
            }

            return {
                id: block.dataset.id,
                type: getBlockType(block),
                content: block.querySelector("textarea").value
            };
        });

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


/* Wikipedia research */

wikipediaToggle.addEventListener("click",() => {
    wikipediaPanel.classList.toggle("visible");

    if(wikipediaPanel.classList.contains("visible")){
        wikipediaSearch.focus();
    }
});

wikipediaClose.addEventListener("click",() => {
    wikipediaPanel.classList.remove("visible");
});


async function searchWikipediaArticles(){
    const query = wikipediaSearch.value.trim();

    if(!query){
        wikipediaResults.innerHTML = `
            <div class="wikipedia-empty">
                Enter a topic to search Wikipedia.
            </div>
        `;
        return;
    }

    wikipediaResults.innerHTML = `
        <div class="wikipedia-loading">
            Searching Wikipedia...
        </div>
    `;

    try{
        const results = await searchWikipedia(query);

        if(results.length === 0){
            wikipediaResults.innerHTML = `
                <div class="wikipedia-empty">
                    No articles found.
                </div>
            `;
            return;
        }

        wikipediaResults.innerHTML = results.map(article => `
            <article class="wikipedia-card">

                <div class="wikipedia-card-content">

                    <span class="wikipedia-card-label">
                        WIKIPEDIA
                    </span>

                    <h3>${article.title}</h3>

                    <p>
                        ${article.description || "No description available."}
                    </p>

                    <button
                        class="wikipedia-view-btn"
                        type="button"
                        data-title="${article.title}"
                    >
                        View article
                    </button>

                </div>

            </article>
        `).join("");

        wikipediaResults
            .querySelectorAll(".wikipedia-view-btn")
            .forEach(button => {
                button.addEventListener("click",() => {
                    openWikipediaArticle(button.dataset.title);
                });
            });

    }catch(error){
        console.error("Wikipedia search failed:",error);

        wikipediaResults.innerHTML = `
            <div class="wikipedia-empty">
                Unable to connect to Wikipedia.
            </div>
        `;
    }
}


async function openWikipediaArticle(title){
    wikipediaResults.innerHTML = `
        <div class="wikipedia-loading">
            Loading article...
        </div>
    `;

    try{
        const article = await getWikipediaSummary(title);

        wikipediaResults.innerHTML = `
            <article class="wikipedia-detail">

                ${
                    article.thumbnail?.source
                        ? `
                            <img
                                src="${article.thumbnail.source}"
                                alt="${article.title}"
                            >
                        `
                        : ""
                }

                <div class="wikipedia-detail-content">

                    <span class="wikipedia-card-label">
                        WIKIPEDIA ARTICLE
                    </span>

                    <h3>${article.title}</h3>

                    <p>
                        ${article.extract || "No summary available."}
                    </p>

                    <div class="wikipedia-detail-actions">

                        <a
                            href="${article.content_urls?.desktop?.page || "#"}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="wikipedia-article-link"
                        >
                            Read full article ↗
                        </a>

                        <button
                            type="button"
                            class="wikipedia-insert-btn"
                            id="wikipediaInsertBtn"
                        >
                            Insert into document
                        </button>

                    </div>

                </div>

            </article>
        `;

        document
            .getElementById("wikipediaInsertBtn")
            .addEventListener("click",() => {
                insertWikipediaArticle(article);
            });

    }catch(error){
        console.error("Wikipedia article failed:",error);

        wikipediaResults.innerHTML = `
            <div class="wikipedia-empty">
                Unable to load this article.
            </div>
        `;
    }
}


function insertWikipediaArticle(article){
    if(!currentDocument){
        return;
    }

    const content =
        `${article.title}\n\n${article.extract || ""}`;

    const block = createBlock(
        "paragraph",
        content,
        false
    );

    editorBlocks.appendChild(block);

    markUnsaved();

    wikipediaPanel.classList.remove("visible");
}


wikipediaSearchBtn.addEventListener(
    "click",
    searchWikipediaArticles
);


wikipediaSearch.addEventListener("keydown",event => {
    if(event.key === "Enter"){
        searchWikipediaArticles();
    }
});


console.log("Knowledge Workspace editor started!");