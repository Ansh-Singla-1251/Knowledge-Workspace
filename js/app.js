import state from "./state/store.js";

import {createWorkspace} from "./workspace/workspace.js";
import {renderWorkspaces} from "./components/workspaceList.js";
import {createFolder} from "./folder/folder.js";
import {renderFolders} from "./components/folderList.js";
import {createDocument} from "./document/document.js";
import {renderDocuments} from "./components/documentList.js";
import {requestInput,resetModalInput} from "./utils/modal.js";
import {showToast} from "./utils/toast.js";
import {openDatabase,loadState,saveState} from "./storage/database.js";
import {renderMindMap} from "./mindmap/mindmap.js";

console.log("Knowledge Workspace started!");

async function initializeApp(){
    try{
        await openDatabase();

        const savedState = await loadState();

        if(savedState.workspaces.length === 0){
            const workspace = createWorkspace("My Workspace");
            state.currentWorkspaceId = workspace.id;

            const collegeFolder = createFolder("College",workspace.id);
            createFolder("Projects",workspace.id);

            createDocument("DSA",workspace.id,collegeFolder.id);
            createDocument("DBMS",workspace.id,collegeFolder.id);

            await saveState(state);
        } else {
            state.workspaces = savedState.workspaces;
            state.folders = savedState.folders;
            state.documents = savedState.documents;
            state.currentWorkspaceId = state.workspaces[0]?.id || null;
        }

        renderWorkspaces(state.workspaces);
        renderFolders(state.currentWorkspaceId);
        renderMindMap();
    }catch(error){
        console.error("Failed to initialize application:",error);
        showToast("Unable to load saved data.","error");
    }
}

initializeApp();

document.getElementById("addWorkspaceBtn").addEventListener("click",async () => {
    resetModalInput();

    const name = await requestInput({
        titleText:"Create workspace",
        descriptionText:"Create a space for a project, subject, or area of knowledge.",
        confirmText:"Create"
    });

    if(!name) return;

    const workspace = createWorkspace(name);

    state.currentWorkspaceId = workspace.id;
    state.currentFolderId = null;
    state.currentDocumentId = null;

    renderWorkspaces(state.workspaces);
    renderFolders(state.currentWorkspaceId);
    document.getElementById("documentGrid").innerHTML = "";

    showToast("Workspace created.");
});

document.getElementById("addFolderBtn").addEventListener("click",async () => {
    if(!state.currentWorkspaceId){
        showToast("Select a workspace first.","error");
        return;
    }

    resetModalInput();

    const name = await requestInput({
        titleText:"Create folder",
        descriptionText:"Organize related documents together.",
        confirmText:"Create"
    });

    if(!name) return;

    createFolder(name,state.currentWorkspaceId);

    renderFolders(state.currentWorkspaceId);

    showToast("Folder created.");
});

async function createNewDocument(){
    if(!state.currentWorkspaceId){
        showToast("Select a workspace first.","error");
        return;
    }

    if(!state.currentFolderId){
        showToast("Select a folder first.","error");
        return;
    }

    resetModalInput();

    const title = await requestInput({
        titleText:"New document",
        descriptionText:"Start a new piece of knowledge.",
        confirmText:"Create"
    });

    if(!title) return;

    createDocument(
        title,
        state.currentWorkspaceId,
        state.currentFolderId
    );

    renderDocuments(state.currentFolderId);

    showToast("Document created.");
}

document.getElementById("createDocumentBtn").addEventListener("click",createNewDocument);

const documentSearch = document.getElementById("documentSearch");

documentSearch.addEventListener("input",event => {
    const query = event.target.value.trim().toLowerCase();

    const documents = state.documents.filter(document =>
        document.title.toLowerCase().includes(query) ||
        document.tags.some(tag =>
            tag.toLowerCase().includes(query)
        )
    );

    renderDocuments(state.currentFolderId,documents);
});


let showingFavorites = false;
let showingRecent = false;

const favoritesFilterBtn =
    document.getElementById("favoritesFilterBtn");

const recentFilterBtn =
    document.getElementById("recentFilterBtn");

favoritesFilterBtn.addEventListener("click",() => {
    showingFavorites = !showingFavorites;
    showingRecent = false;

    recentFilterBtn.classList.remove("active");

    if(showingFavorites){
        const favoriteDocuments = state.documents.filter(
            document => document.favorite
        );

        renderDocuments(state.currentFolderId,favoriteDocuments);

        favoritesFilterBtn.classList.add("active");
    }else{
        renderDocuments(state.currentFolderId);

        favoritesFilterBtn.classList.remove("active");
    }
});

recentFilterBtn.addEventListener("click",() => {
    showingRecent = !showingRecent;
    showingFavorites = false;

    favoritesFilterBtn.classList.remove("active");

    if(showingRecent){
        const recentDocuments = [...state.documents]
            .filter(document => document.lastOpenedAt)
            .sort(
                (a,b) =>
                    new Date(b.lastOpenedAt) -
                    new Date(a.lastOpenedAt)
            );

        renderDocuments(state.currentFolderId,recentDocuments);

        recentFilterBtn.classList.add("active");
    }else{
        renderDocuments(state.currentFolderId);

        recentFilterBtn.classList.remove("active");
    }
});