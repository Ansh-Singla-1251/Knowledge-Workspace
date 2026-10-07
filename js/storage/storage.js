import state from "../state/store.js";
import {saveState} from "./database.js";

export async function persistState(){
    await saveState(state);

    localStorage.setItem(
        "knowledgeWorkspaceUpdate",
        Date.now().toString()
    );

    window.dispatchEvent(
        new CustomEvent("knowledgeWorkspaceUpdate")
    );
}