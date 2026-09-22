import state from "./state/store.js";
import { createWorkspace } from "./workspace/workspace.js";
import { renderWorkspaces } from "./components/workspaceList.js";

console.log("Knowledge Workspace started!");

if (state.workspaces.length === 0) {
    const defaultWorkspace = createWorkspace("My Workspace");
    state.currentWorkspaceId = defaultWorkspace.id;
} 
else {
    state.currentWorkspaceId = state.workspaces[0].id;
}
renderWorkspaces(state.workspaces);

console.log(state);
const addWorkspaceBtn = document.getElementById("addWorkspaceBtn");

addWorkspaceBtn.addEventListener("click", () => {

    const name = prompt("Enter workspace name:");

    if (!name || name.trim() === "") {
        return;
    }

    const workspace = createWorkspace(name.trim());

    renderWorkspaces(state.workspaces);

    console.log("Workspace created:", workspace);
});