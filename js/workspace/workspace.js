import state from "../state/store.js";
import { generateId } from "../utils/id.js";

export function createWorkspace(name) {

    const workspace = {
        id: generateId("workspace"),
        name: name,
        createdAt: new Date()
    };

    state.workspaces.push(workspace);

    return workspace;
}


export function selectWorkspace(workspaceId) {

    const workspace = state.workspaces.find(
        workspace => workspace.id === workspaceId
    );

    if (!workspace) {
        return;
    }

    state.currentWorkspaceId = workspaceId;

    return workspace;
}