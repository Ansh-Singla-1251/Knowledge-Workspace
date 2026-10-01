import state from "../state/store.js";
import {saveState} from "./database.js";

export function persistState(){
    return saveState(state);
}