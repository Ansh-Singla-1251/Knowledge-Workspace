import state from "../state/store.js";

import {
    selectFolder,
    getWorkspaceFolders,
    updateFolder,
    deleteFolder
} from "../folder/folder.js";

import {
    renderDocuments
} from "./documentList.js";

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

export function renderFolders(workspaceId){

    const folderList =
        document.getElementById("folderList");

    folderList.innerHTML = "";

    if(!workspaceId){
        return;
    }

    const folders =
        getWorkspaceFolders(workspaceId);

    if(folders.length === 0){
        state.currentFolderId = null;

        const documentGrid =
            document.getElementById("documentGrid");

        documentGrid.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ${icons.folder}
                </div>

                <h3>
                    No folders yet
                </h3>

                <p>
                    Create your first folder to start organizing this workspace.
                </p>

                <button
                    id="emptyCreateFolderBtn"
                    class="primary-btn"
                    type="button"
                >
                    Create your first folder
                </button>

            </div>

        `;

        const createFolderButton =
            document.getElementById(
                "emptyCreateFolderBtn"
            );

        createFolderButton.addEventListener(
            "click",
            () => {
                document
                    .getElementById("addFolderBtn")
                    .click();
            }
        );

        return;
    }

    if(!state.currentFolderId){

        const documentGrid =
            document.getElementById("documentGrid");

        documentGrid.innerHTML = folders.map(folder => {

            const documentCount =
                state.documents.filter(
                    document =>
                        document.folderId === folder.id &&
                        !document.deletedAt
                ).length;

            return `

                <div
                    class="document-card folder-card"
                    data-folder-id="${folder.id}"
                >

                    <div class="document-card-top">

                        <div class="document-icon">
                            ${icons.folder}
                        </div>

                    </div>

                    <div class="document-info">

                        <h3>
                            ${folder.name}
                        </h3>

                        <p>
                            ${
                                documentCount === 1
                                    ? "1 document"
                                    : `${documentCount} documents`
                            }
                        </p>

                    </div>

                </div>

            `;

        }).join("");

        documentGrid
            .querySelectorAll(".folder-card")
            .forEach(card => {

                card.addEventListener(
                    "click",
                    () => {
                    selectFolder(card.dataset.folderId);

                    window.dispatchEvent(
                        new CustomEvent("folderSelectionChanged")
                    );

                    renderFolders(state.currentWorkspaceId);
                    renderDocuments(state.currentFolderId);

                    }
                );

            });
    }

    folders.forEach(folder => {

        const folderElement =
            document.createElement("div");

        folderElement.classList.add(
            "folder-item"
        );

        folderElement.dataset.id =
            folder.id;

        folderElement.innerHTML = `

            <span class="folder-icon">
                ${icons.folder}
            </span>

            <span class="folder-name">
                ${folder.name}
            </span>

            <button
                class="rename-folder-btn"
                title="Rename folder"
                type="button"
            >
                ${icons.edit}
            </button>

            <button
                class="delete-folder-btn"
                title="Delete folder"
                type="button"
            >
                ${icons.trash}
            </button>

        `;

        if(
            folder.id ===
            state.currentFolderId
        ){
            folderElement.classList.add(
                "active"
            );
        }

        folderElement.addEventListener(
            "click",
            () => {

               selectFolder(folder.id);

                window.dispatchEvent(
                    new CustomEvent("folderSelectionChanged")
                );

                renderFolders(state.currentWorkspaceId);
                renderDocuments(state.currentFolderId);

            }
        );

        const renameButton =
            folderElement.querySelector(
                ".rename-folder-btn"
            );

        renameButton.addEventListener(
            "click",
            async event => {

                event.stopPropagation();

                resetModalInput();

                const newName =
                    await requestInput({

                        titleText:
                            "Rename folder",

                        descriptionText:
                            "Choose a clear name for this folder.",

                        value:
                            folder.name,

                        confirmText:
                            "Save"

                    });

                if(!newName){
                    return;
                }

                updateFolder(
                    folder.id,
                    newName
                );

                renderFolders(
                    state.currentWorkspaceId
                );

                showToast(
                    "Folder renamed."
                );

            }
        );

        const deleteButton =
            folderElement.querySelector(
                ".delete-folder-btn"
            );

        deleteButton.addEventListener(
            "click",
            async event => {

                event.stopPropagation();

                const confirmed =
                    await requestConfirmation({

                        titleText:
                            "Delete folder?",

                        descriptionText:
                            `Deleting "${folder.name}" will also remove all documents inside it.`,

                        confirmText:
                            "Delete folder"

                    });

                if(!confirmed){
                    return;
                }

                deleteFolder(
                    folder.id
                );

                if(
                    state.currentFolderId ===
                    folder.id
                ){
                    state.currentFolderId = null;
                }

                renderFolders(
                    state.currentWorkspaceId
                );

                showToast(
                    "Folder deleted."
                );

            }
        );

        folderList.appendChild(
            folderElement
        );

    });
}