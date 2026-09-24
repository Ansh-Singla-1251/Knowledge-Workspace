import state from "../state/store.js";

import {
    selectDocument,
    getFolderDocuments,
    deleteDocument,
    updateDocument
} from "../document/document.js";

import {
    icons
} from "../utils/icons.js";

import {
    requestInput,
    requestConfirmation,
    resetModalInput
} from "../utils/modal.js";

import {
    showToast
} from "../utils/toast.js";


export function renderDocuments(
    folderId
) {

    const documentGrid =
        document.getElementById(
            "documentGrid"
        );

    documentGrid.innerHTML =
        "";


    const documents =
        getFolderDocuments(
            folderId
        );


    if (documents.length === 0) {

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

            </div>

        `;

        return;
    }


    documents.forEach(
        doc => {

            const documentElement =
                document.createElement(
                    "div"
                );


            documentElement.classList.add(
                "document-card"
            );


            documentElement.dataset.id =
                doc.id;


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

                </div>

                <button
                    class="rename-document-btn"
                    title="Rename document"
                >
                    ${icons.edit}
                </button>

                <button
                    class="delete-document-btn"
                    title="Delete document"
                >
                    ${icons.trash}
                </button>

            `;


            if (
                doc.id ===
                state.currentDocumentId
            ) {

                documentElement.classList.add(
                    "active"
                );

            }


            documentElement.addEventListener(
                "click",
                () => {

                    selectDocument(
                        doc.id
                    );

                    renderDocuments(
                        state.currentFolderId
                    );

                }
            );


            const renameButton =
                documentElement.querySelector(
                    ".rename-document-btn"
                );


            renameButton.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();

                    resetModalInput();

                    const newTitle =
                        await requestInput({

                            titleText:
                                "Rename document",

                            descriptionText:
                                "Give your document a clear, memorable title.",

                            value:
                                doc.title,

                            confirmText:
                                "Save"

                        });


                    if (!newTitle) {
                        return;
                    }


                    updateDocument(
                        doc.id,
                        newTitle
                    );


                    renderDocuments(
                        state.currentFolderId
                    );


                    showToast(
                        "Document renamed."
                    );

                }
            );


            const deleteButton =
                documentElement.querySelector(
                    ".delete-document-btn"
                );


            deleteButton.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();

                    const confirmed =
                        await requestConfirmation({

                            titleText:
                                "Delete document?",

                            descriptionText:
                                `"${doc.title}" will be removed from this folder.`,

                            confirmText:
                                "Delete document"

                        });


                    if (!confirmed) {
                        return;
                    }


                    deleteDocument(
                        doc.id
                    );


                    renderDocuments(
                        state.currentFolderId
                    );


                    showToast(
                        "Document deleted."
                    );

                }
            );


            documentGrid.appendChild(
                documentElement
            );

        }
    );

}