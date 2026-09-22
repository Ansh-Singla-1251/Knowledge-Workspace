import state from "../state/store.js";
import { selectWorkspace } from "../workspace/workspace.js";

export function renderWorkspaces(workspaces) {

    const workspaceList = document.getElementById("workspaceList");

    workspaceList.innerHTML = "";

    workspaces.forEach(workspace => {

        const workspaceElement = document.createElement("button");

        workspaceElement.classList.add("workspace-item");

        workspaceElement.textContent = workspace.name;

        workspaceElement.dataset.id = workspace.id;

        if (workspace.id === state.currentWorkspaceId) {
            workspaceElement.classList.add("active");
        }

        workspaceElement.addEventListener("click", () => {

            selectWorkspace(workspace.id);

            renderWorkspaces(state.workspaces);

            console.log(
                "Current workspace:",
                state.currentWorkspaceId
            );
        });

        workspaceList.appendChild(workspaceElement);
    });
}