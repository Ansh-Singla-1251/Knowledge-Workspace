import state from "../state/store.js";

import {
    selectWorkspace,
    updateWorkspace,
    deleteWorkspace
} from "../workspace/workspace.js";

import {
    renderFolders
} from "./folderList.js";

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

export function selectWorkspaceUI(workspaceId){

    selectWorkspace(
        workspaceId
    );

    state.currentFolderId = null;
    state.currentDocumentId = null;

    window.dispatchEvent(
        new CustomEvent("folderSelectionChanged")
    );

    window.showingFavorites = false;
    window.showingRecent = false;

    const favoritesFilterBtn =
        document.getElementById("favoritesFilterBtn");

    const recentFilterBtn =
        document.getElementById("recentFilterBtn");

    if(favoritesFilterBtn){
        favoritesFilterBtn.classList.remove("active");
    }

    if(recentFilterBtn){
        recentFilterBtn.classList.remove("active");
    }

    const documentSearch =
        document.getElementById("documentSearch");

    if(documentSearch){
        documentSearch.value = "";
    }

    renderWorkspaces(
        state.workspaces
    );

    renderFolders(
        state.currentWorkspaceId
    );
}
export function renderWorkspaces(
    workspaces
) {

    const workspaceList =
        document.getElementById(
            "workspaceList"
        );

    workspaceList.innerHTML =
        "";


    workspaces.forEach(
        workspace => {

            const workspaceElement =
                document.createElement(
                    "div"
                );


            workspaceElement.classList.add(
                "workspace-item"
            );


            workspaceElement.dataset.id =
                workspace.id;


            workspaceElement.innerHTML = `

                <span class="workspace-icon">
                    ${icons.workspace}
                </span>

                <span class="workspace-name">
                    ${workspace.name}
                </span>

                <button
                    class="rename-workspace-btn"
                    title="Rename workspace"
                >
                    ${icons.edit}
                </button>

                <button
                    class="delete-workspace-btn"
                    title="Delete workspace"
                >
                    ${icons.trash}
                </button>

            `;


            if (
                workspace.id ===
                state.currentWorkspaceId
            ) {

                workspaceElement.classList.add(
                    "active"
                );

            }


            workspaceElement.addEventListener(
                "click",
                () => {
                    selectWorkspaceUI(workspace.id);
                }
            );


            const renameButton =
                workspaceElement.querySelector(
                    ".rename-workspace-btn"
                );


            renameButton.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();

                    resetModalInput();

                    const newName =
                        await requestInput({

                            titleText:
                                "Rename workspace",

                            descriptionText:
                                "Give this workspace a name that makes sense to you.",

                            value:
                                workspace.name,

                            confirmText:
                                "Save"

                        });


                    if (!newName) {
                        return;
                    }


                    updateWorkspace(
                        workspace.id,
                        newName
                    );


                    renderWorkspaces(
                        state.workspaces
                    );


                    showToast(
                        "Workspace renamed."
                    );

                }
            );


            const deleteButton =
                workspaceElement.querySelector(
                    ".delete-workspace-btn"
                );


            deleteButton.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();

                    const confirmed =
                        await requestConfirmation({

                            titleText:
                                "Delete workspace?",

                            descriptionText:
                                `Deleting "${workspace.name}" will also remove all folders and documents inside it.`,

                            confirmText:
                                "Delete workspace"

                        });


                    if (!confirmed) {
                        return;
                    }


                    deleteWorkspace(
                        workspace.id
                    );


                    renderWorkspaces(
                        state.workspaces
                    );


                    document.getElementById(
                        "folderList"
                    ).innerHTML = "";


                    document.getElementById(
                        "documentGrid"
                    ).innerHTML = "";


                    showToast(
                        "Workspace deleted."
                    );

                }
            );


            workspaceList.appendChild(
                workspaceElement
            );

        }
    );

}