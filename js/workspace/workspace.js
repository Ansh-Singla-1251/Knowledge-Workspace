import state from "../state/store.js";

import {
    generateId
} from "../utils/id.js";


export function createWorkspace(name) {

    const workspace = {

        id: generateId("workspace"),

        name: name,

        createdAt: new Date()

    };

    state.workspaces.push(
        workspace
    );

    return workspace;

}


export function selectWorkspace(
    workspaceId
) {

    const workspace =
        state.workspaces.find(
            workspace =>
                workspace.id === workspaceId
        );

    if (!workspace) {
        return;
    }

    state.currentWorkspaceId =
        workspaceId;

    return workspace;

}


export function updateWorkspace(
    workspaceId,
    newName
) {

    const workspace =
        state.workspaces.find(
            workspace =>
                workspace.id === workspaceId
        );

    if (!workspace) {
        return;
    }

    workspace.name =
        newName;

    return workspace;

}


export function deleteWorkspace(
    workspaceId
) {

    state.documents =
        state.documents.filter(
            document =>
                document.workspaceId !== workspaceId
        );

    state.folders =
        state.folders.filter(
            folder =>
                folder.workspaceId !== workspaceId
        );


    const workspaceIndex =
        state.workspaces.findIndex(
            workspace =>
                workspace.id === workspaceId
        );

    if (workspaceIndex === -1) {
        return;
    }


    state.workspaces.splice(
        workspaceIndex,
        1
    );


    if (
        state.currentWorkspaceId ===
        workspaceId
    ) {

        state.currentWorkspaceId =
            null;

        state.currentFolderId =
            null;

        state.currentDocumentId =
            null;

    }

}