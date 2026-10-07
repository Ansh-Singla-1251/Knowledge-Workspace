import state from "../state/store.js";
import {saveState} from "./database.js";
import {showToast} from "../utils/toast.js";

export function importWorkspace(file){

    const reader = new FileReader();

    reader.onload = async event => {
        try{
            const data = JSON.parse(event.target.result);

            if(
                !data ||
                data.version !== 1 ||
                !Array.isArray(data.workspaces) ||
                !Array.isArray(data.folders) ||
                !Array.isArray(data.documents)
            ){
                throw new Error("Invalid workspace file.");
            }

            state.workspaces = data.workspaces;
            state.folders = data.folders;
            state.documents = data.documents;

            state.currentWorkspaceId =
                state.workspaces[0]?.id || null;

            state.currentFolderId = null;
            state.currentDocumentId = null;

            await saveState(state);

            localStorage.setItem(
                "knowledgeWorkspaceUpdate",
                Date.now().toString()
            );

            window.dispatchEvent(
                new CustomEvent("knowledgeWorkspaceUpdate")
            );

            showToast("Workspace imported successfully.");

        }catch(error){
            console.error("Import failed:",error);

            showToast(
                "Invalid workspace file.",
                "error"
            );
        }
    };

    reader.readAsText(file);
}