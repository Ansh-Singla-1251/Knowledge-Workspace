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


export function renderFolders(
    workspaceId
) {

    const folderList =
        document.getElementById(
            "folderList"
        );

    folderList.innerHTML =
        "";


    if (!workspaceId) {
        return;
    }


    const folders =
        getWorkspaceFolders(
            workspaceId
        );


    folders.forEach(
        folder => {

            const folderElement =
                document.createElement(
                    "div"
                );


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
                >
                    ${icons.edit}
                </button>

                <button
                    class="delete-folder-btn"
                    title="Delete folder"
                >
                    ${icons.trash}
                </button>

            `;


            if (
                folder.id ===
                state.currentFolderId
            ) {

                folderElement.classList.add(
                    "active"
                );

            }


            folderElement.addEventListener(
                "click",
                () => {

                    selectFolder(
                        folder.id
                    );

                    renderFolders(
                        state.currentWorkspaceId
                    );

                    renderDocuments(
                        state.currentFolderId
                    );

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


                    if (!newName) {
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


                    if (!confirmed) {
                        return;
                    }


                    deleteFolder(
                        folder.id
                    );


                    renderFolders(
                        state.currentWorkspaceId
                    );


                    document.getElementById(
                        "documentGrid"
                    ).innerHTML = "";


                    showToast(
                        "Folder deleted."
                    );

                }
            );


            folderList.appendChild(
                folderElement
            );

        }
    );

}