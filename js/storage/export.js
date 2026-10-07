import state from "../state/store.js";
import {showToast} from "../utils/toast.js";

export function exportWorkspace(){

    const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        workspaces: state.workspaces,
        folders: state.folders,
        documents: state.documents
    };

    const blob = new Blob(
        [JSON.stringify(data,null,4)],
        {
            type:"application/json"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download =
        `knowledge-workspace-${new Date().toISOString().split("T")[0]}.json`;

    link.click();

    URL.revokeObjectURL(url);

    showToast("Workspace exported successfully.");
}
