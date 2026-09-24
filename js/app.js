import state from "./state/store.js";


import {
    createWorkspace
} from "./workspace/workspace.js";


import {
    renderWorkspaces
} from "./components/workspaceList.js";


import {
    createFolder
} from "./folder/folder.js";


import {
    renderFolders
} from "./components/folderList.js";


import {
    createDocument
} from "./document/document.js";


import {
    renderDocuments
} from "./components/documentList.js";


import {
    requestInput,
    resetModalInput
} from "./utils/modal.js";


import {
    showToast
} from "./utils/toast.js";


console.log(
    "Knowledge Workspace started!"
);


const workspace =
    createWorkspace(
        "My Workspace"
    );


state.currentWorkspaceId =
    workspace.id;


const collegeFolder =
    createFolder(
        "College",
        workspace.id
    );


const projectsFolder =
    createFolder(
        "Projects",
        workspace.id
    );


const dsaDocument =
    createDocument(
        "DSA",
        workspace.id,
        collegeFolder.id
    );


const dbmsDocument =
    createDocument(
        "DBMS",
        workspace.id,
        collegeFolder.id
    );




renderWorkspaces(
    state.workspaces
);


renderFolders(
    state.currentWorkspaceId
);


document
    .getElementById(
        "addWorkspaceBtn"
    )
    .addEventListener(
        "click",
        async () => {

            resetModalInput();

            const name =
                await requestInput({

                    titleText:
                        "Create workspace",

                    descriptionText:
                        "Create a space for a project, subject, or area of knowledge.",

                    confirmText:
                        "Create"

                });


            if (!name) {
                return;
            }


            const workspace =
                createWorkspace(
                    name
                );


            state.currentWorkspaceId =
                workspace.id;


            state.currentFolderId =
                null;


            state.currentDocumentId =
                null;


            renderWorkspaces(
                state.workspaces
            );


            renderFolders(
                state.currentWorkspaceId
            );


            document.getElementById(
                "documentGrid"
            ).innerHTML = "";


            showToast(
                "Workspace created."
            );

        }
    );


document
    .getElementById(
        "addFolderBtn"
    )
    .addEventListener(
        "click",
        async () => {

            if (
                !state.currentWorkspaceId
            ) {

                showToast(
                    "Select a workspace first.",
                    "error"
                );

                return;
            }


            resetModalInput();

            const name =
                await requestInput({

                    titleText:
                        "Create folder",

                    descriptionText:
                        "Organize related documents together.",

                    confirmText:
                        "Create"

                });


            if (!name) {
                return;
            }


            createFolder(
                name,
                state.currentWorkspaceId
            );


            renderFolders(
                state.currentWorkspaceId
            );


            showToast(
                "Folder created."
            );

        }
    );


async function createNewDocument() {

    if (
        !state.currentWorkspaceId
    ) {

        showToast(
            "Select a workspace first.",
            "error"
        );

        return;
    }


    if (
        !state.currentFolderId
    ) {

        showToast(
            "Select a folder first.",
            "error"
        );

        return;
    }


    resetModalInput();

    const title =
        await requestInput({

            titleText:
                "New document",

            descriptionText:
                "Start a new piece of knowledge.",

            confirmText:
                "Create"

        });


    if (!title) {
        return;
    }


    createDocument(
        title,
        state.currentWorkspaceId,
        state.currentFolderId
    );


    renderDocuments(
        state.currentFolderId
    );


    showToast(
        "Document created."
    );

}


document
    .getElementById(
        "createDocumentBtn"
    )
    .addEventListener(
        "click",
        createNewDocument
    );


document
    .getElementById(
        "emptyCreateDocumentBtn"
    )
    .addEventListener(
        "click",
        createNewDocument
    );