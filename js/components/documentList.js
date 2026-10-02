import state from "../state/store.js";

import {selectDocument,getFolderDocuments,deleteDocument,updateDocument} from "../document/document.js";

import {icons} from "../utils/icons.js";

import {requestInput,requestConfirmation,resetModalInput} from "../utils/modal.js";

import {showToast} from "../utils/toast.js";

import {persistState} from "../storage/storage.js";


export function renderDocuments(folderId,documents = null){
    const documentGrid = document.getElementById("documentGrid");
    documentGrid.innerHTML = "";

    documents = documents || getFolderDocuments(folderId);

    if(documents.length === 0){
        documentGrid.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ${icons.document}
                </div>

                <h3>
                    No documents yet
                </h3>

                <p>
                    Create a document in this folder to start building
                    your knowledge workspace.
                </p>

                <button
                id="emptyCreateDocumentBtn"
                class="primary-btn"
                type="button"
                >
                    Create your first document
                </button>

            </div>

        `;

        const createButton =
            document.getElementById("emptyCreateDocumentBtn");

        createButton.addEventListener("click",() => {
            const mainCreateButton =
                document.getElementById("createDocumentBtn");

            if(mainCreateButton){
                mainCreateButton.click();
            }
        });

        return;
    }


    documents.forEach(doc => {

        const documentElement = document.createElement("div");

        documentElement.classList.add("document-card");

        documentElement.dataset.id = doc.id;

        documentElement.innerHTML = `

            <div class="document-icon">
                ${icons.document}
            </div>

            <div class="document-info">

                <h3>
                    ${doc.title}
                </h3>

                <p>
                    ${doc.blocks.length} blocks
                </p>

                ${doc.tags.length > 0 ? `
                    <div class="document-tags">
                        ${doc.tags.map(tag => `<span>#${tag}</span>`).join("")}
                    </div>
                ` : ""}

            </div>

            <button
                class="rename-document-btn"
                title="Rename document"
            >
                ${icons.edit}
            </button>

            <button
                class="favorite-document-btn"
                title="Toggle favorite"
            >
                ${doc.favorite ? "★" : "☆"}
            </button>

            <button
                class="tag-document-btn"
                title="Edit tags"
            >
                #
            </button>

            <button
                class="delete-document-btn"
                title="Delete document"
            >
                ${icons.trash}
            </button>

        `;


        if(doc.id === state.currentDocumentId){
            documentElement.classList.add("active");
        }


        documentElement.addEventListener("click",event => {

            if(
                event.target.closest(".rename-document-btn") ||
                event.target.closest(".favorite-document-btn") ||
                event.target.closest(".tag-document-btn") ||
                event.target.closest(".delete-document-btn")
            ){
                return;
            }

            selectDocument(doc.id);

            window.location.href =
                `editor.html?id=${encodeURIComponent(doc.id)}`;

        });


        const renameButton =
            documentElement.querySelector(".rename-document-btn");


        renameButton.addEventListener("click",async event => {

            event.stopPropagation();

            resetModalInput();

            const newTitle = await requestInput({
                titleText:"Rename document",
                descriptionText:"Give your document a clear, memorable title.",
                value:doc.title,
                confirmText:"Save"
            });

            if(!newTitle){
                return;
            }

            updateDocument(doc.id,newTitle);

            renderDocuments(state.currentFolderId);

            showToast("Document renamed.");

        });


        const favoriteButton =
            documentElement.querySelector(".favorite-document-btn");


        favoriteButton.addEventListener("click",event => {

            event.stopPropagation();

            doc.favorite = !doc.favorite;

            persistState();

            renderDocuments(state.currentFolderId);

            showToast(
                doc.favorite
                    ? "Document added to favorites."
                    : "Document removed from favorites."
            );

        });


        const tagButton =
            documentElement.querySelector(".tag-document-btn");


        tagButton.addEventListener("click",async event => {

            event.stopPropagation();

            resetModalInput();

            const tags = await requestInput({
                titleText:"Edit document tags",
                descriptionText:"Enter tags separated by commas.",
                value:doc.tags.join(", "),
                confirmText:"Save"
            });

            if(tags === null){
                return;
            }

            doc.tags = tags
                .split(",")
                .map(tag => tag.trim().toLowerCase())
                .filter(tag => tag);

            persistState();

            renderDocuments(state.currentFolderId);

            showToast("Tags updated.");

        });


        const deleteButton =
            documentElement.querySelector(".delete-document-btn");


        deleteButton.addEventListener("click",async event => {

            event.stopPropagation();

            const confirmed = await requestConfirmation({
                titleText:"Delete document?",
                descriptionText:`"${doc.title}" will be removed from this folder.`,
                confirmText:"Delete document"
            });

            if(!confirmed){
                return;
            }

            deleteDocument(doc.id);

            renderDocuments(state.currentFolderId);

            showToast("Document deleted.");

        });


        documentGrid.appendChild(documentElement);

    });

}