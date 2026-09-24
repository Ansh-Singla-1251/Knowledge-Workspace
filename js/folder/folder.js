import state from "../state/store.js";

import {
    generateId
} from "../utils/id.js";


export function createFolder(
    name,
    workspaceId
) {

    const folder = {

        id: generateId("folder"),

        name: name,

        workspaceId: workspaceId,

        createdAt: new Date()

    };

    state.folders.push(
        folder
    );

    return folder;

}


export function getWorkspaceFolders(
    workspaceId
) {

    return state.folders.filter(
        folder =>
            folder.workspaceId === workspaceId
    );

}


export function selectFolder(
    folderId
) {

    const folder =
        state.folders.find(
            folder =>
                folder.id === folderId
        );

    if (!folder) {
        return;
    }

    state.currentFolderId =
        folderId;

    return folder;

}


export function updateFolder(
    folderId,
    newName
) {

    const folder =
        state.folders.find(
            folder =>
                folder.id === folderId
        );

    if (!folder) {
        return;
    }

    folder.name =
        newName;

    return folder;

}


export function deleteFolder(
    folderId
) {

    state.documents =
        state.documents.filter(
            document =>
                document.folderId !== folderId
        );


    const folderIndex =
        state.folders.findIndex(
            folder =>
                folder.id === folderId
        );

    if (folderIndex === -1) {
        return;
    }


    state.folders.splice(
        folderIndex,
        1
    );


    if (
        state.currentFolderId ===
        folderId
    ) {

        state.currentFolderId =
            null;

        state.currentDocumentId =
            null;

    }

}