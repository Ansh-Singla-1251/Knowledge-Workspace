import state from "./state/store.js";
import {createWorkspace} from "./workspace/workspace.js";
import {renderWorkspaces,selectWorkspaceUI} from "./components/workspaceList.js";
import {createFolder} from "./folder/folder.js";
import {renderFolders} from "./components/folderList.js";
import {createDocument,cleanupTrash} from "./document/document.js";
import {renderDocuments} from "./components/documentList.js";
import {requestInput,resetModalInput} from "./utils/modal.js";
import {showToast} from "./utils/toast.js";
import {openDatabase,loadState,saveState} from "./storage/database.js";
import {renderMindMap} from "./mindmap/mindmap.js";
import {searchWikipedia,getWikipediaSummary} from "./wikipedia/wikipedia.js";
import {icons} from "./utils/icons.js";
import {renderLibraryDocuments} from "./documents/documents.js";
import {renderTrash} from "./trash/trash.js";
import {exportWorkspace} from "./storage/export.js";
import {importWorkspace} from "./storage/import.js";
import {logoutUser} from "./auth/auth.js";

console.log("Knowledge Workspace started!");

const isDocumentsPage =
    document.getElementById("documentLibraryGrid") !== null;

const isTrashPage =
    document.getElementById("trashGrid") !== null;
const isMindMapsPage =
    document.getElementById("mindMapsGrid") !== null;

const isFavoritesPage =
    document.getElementById("favoritesGrid") !== null;

async function initializeApp(){
    try{
        await openDatabase();
        const savedState = await loadState();

        state.workspaces = savedState.workspaces;
        state.folders = savedState.folders;
        state.documents = savedState.documents;
        state.attachments = savedState.attachments || [];
        cleanupTrash();

        if(savedState.workspaces.length === 0){
            const workspace = createWorkspace("My Workspace");
            state.currentWorkspaceId = workspace.id;

            const collegeFolder = createFolder("College",workspace.id);
            createFolder("Projects",workspace.id);

            createDocument("DSA",workspace.id,collegeFolder.id);
            createDocument("DBMS",workspace.id,collegeFolder.id);

            await saveState(state);
        }else{
            state.currentWorkspaceId =
                state.workspaces[0]?.id || null;
        }

        if(isDocumentsPage){
            renderLibraryDocuments(
                state.documents.filter(
                    document =>
                        !document.deletedAt
                )
            );

            const exportWorkspaceBtn =
                document.getElementById("exportWorkspaceBtn");

            if(exportWorkspaceBtn){
                exportWorkspaceBtn.addEventListener(
                    "click",
                    exportWorkspace
                );
            }

            const importWorkspaceBtn =
                document.getElementById("importWorkspaceBtn");

            const importWorkspaceInput =
                document.getElementById("importWorkspaceInput");

            if(
                importWorkspaceBtn &&
                importWorkspaceInput
            ){
                importWorkspaceBtn.addEventListener(
                    "click",
                    () => {
                        importWorkspaceInput.click();
                    }
                );

                importWorkspaceInput.addEventListener(
                    "change",
                    event => {
                        const file =
                            event.target.files[0];

                        if(!file){
                            return;
                        }

                        importWorkspace(file);
                        event.target.value = "";
                    }
                );
            }

            return;
        }
        if(isMindMapsPage){
            renderLibraryDocuments(
                state.documents.filter(
                    document =>
                        !document.deletedAt &&
                        document.blocks?.some(
                            block =>
                                block.type === "mindmap"
                        )
                ),
                "mindMapsGrid"
            );

            return;
        }

        if(isFavoritesPage){
            renderLibraryDocuments(
                state.documents.filter(
                    document =>
                        !document.deletedAt &&
                        document.favorite === true
                ),
                "favoritesGrid"
            );
            return;
        }
        if(isTrashPage){
            renderTrash();
            return;
        }

        renderWorkspaces(state.workspaces);

        state.currentFolderId = null;
        state.currentDocumentId = null;

        renderFolders(state.currentWorkspaceId);

        window.dispatchEvent(
            new CustomEvent("folderSelectionChanged")
        );

        renderDocuments(state.currentFolderId);
        renderMindMap();
    }
    catch(error){
        console.error(
            "Failed to initialize application:",
            error
        );

        if( !isDocumentsPage && !isMindMapsPage && !isFavoritesPage && !isTrashPage){
            showToast(
                "Unable to load saved data.",
                "error"
            );
        }
    }
}

function showWorkspaceFolders(){
    const documentGrid =
        document.getElementById("documentGrid");

    if(!documentGrid){
        return;
    }

    const folders =
        state.folders.filter(
            folder =>
                folder.workspaceId ===
                state.currentWorkspaceId
        );

    documentGrid.innerHTML = "";

    if(folders.length === 0){
        documentGrid.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    📁
                </div>

                <h3>
                    No folders yet
                </h3>

                <p>
                    Create a folder to start organizing your knowledge.
                </p>

            </div>
        `;

        return;
    }

    folders.forEach(folder => {
        const card =
            document.createElement("article");

        card.className =
            "document-card";

        card.innerHTML = `
            <div class="document-card-content">

                <div class="empty-icon">
                    📁
                </div>

                <h3>
                    ${folder.name}
                </h3>

                <p>
                    Open folder to view documents.
                </p>

            </div>
        `;

        card.addEventListener(
            "click",
            () => {
                state.currentFolderId =
                    folder.id;

                renderDocuments(
                    folder.id
                );

                window.dispatchEvent(
                    new CustomEvent(
                        "folderSelectionChanged"
                    )
                );
            }
        );

        documentGrid.appendChild(card);
    });
}

const sidebarToggleBtn =
    document.getElementById("sidebarToggleBtn");

const sidebar =
    document.querySelector(".sidebar");

const sidebarToggleContainer =
    document.getElementById("sidebarToggleContainer");

const topbar =
    document.querySelector(".topbar");

if(
    sidebarToggleBtn &&
    sidebar &&
    sidebarToggleContainer &&
    topbar
){
    sidebarToggleBtn.addEventListener(
        "click",
        () => {
            const isOpen =
                sidebar.classList.toggle("mobile-open");

            if(isOpen){
                sidebarToggleContainer.appendChild(
                    sidebarToggleBtn
                );

                sidebarToggleBtn.setAttribute(
                    "aria-label",
                    "Close sidebar"
                );
            }else{
                topbar.insertBefore(
                    sidebarToggleBtn,
                    topbar.firstElementChild
                );

                sidebarToggleBtn.setAttribute(
                    "aria-label",
                    "Open sidebar"
                );
            }
        }
    );
}

initializeApp();

window.addEventListener(
    "knowledgeWorkspaceUpdate",
    event => {
        if(isDocumentsPage || isMindMapsPage || isFavoritesPage || isTrashPage){
            return;
        }

        const folderId =
            event.detail?.folderId ||
            state.currentFolderId;

        if(folderId){
            state.currentFolderId = folderId;

            renderFolders(
                state.currentWorkspaceId
            );

            renderDocuments(folderId);
        }else{
            renderFolders(
                state.currentWorkspaceId
            );
        }

        renderMindMap();
    }
);

if(!isDocumentsPage && !isTrashPage && !isMindMapsPage && !isFavoritesPage){

    document.getElementById(
        "addWorkspaceBtn"
    ).addEventListener(
        "click",
        async () => {
            resetModalInput();

            const name = await requestInput({
                titleText:"Create workspace",
                descriptionText:
                    "Create a space for a project, subject, or area of knowledge.",
                confirmText:"Create"
            });

            if(!name) return;

            const workspace =
                createWorkspace(name);

            state.currentWorkspaceId =
                workspace.id;

            state.currentFolderId = null;
            state.currentDocumentId = null;

            renderWorkspaces(
                state.workspaces
            );

            renderFolders(
                state.currentWorkspaceId
            );

            document.getElementById(
                "documentGrid"
            ).innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        ${icons.document}
                    </div>

                    <h3>
                        No folder selected
                    </h3>

                    <p>
                        Create a folder in this workspace to start organizing your documents.
                    </p>

                </div>
            `;

            showToast(
                "Workspace created."
            );
        }
    );

    document.getElementById(
        "addFolderBtn"
    ).addEventListener(
        "click",
        async () => {
            if(!state.currentWorkspaceId){
                showToast(
                    "Select a workspace first.",
                    "error"
                );
                return;
            }

            resetModalInput();

            const name = await requestInput({
                titleText:"Create folder",
                descriptionText:
                    "Organize related documents together.",
                confirmText:"Create"
            });

            if(!name) return;

            createFolder(
                name,
                state.currentWorkspaceId
            );

            renderFolders(
                state.currentWorkspaceId
            );

            showToast(
                "Folder created."
            );
        }
    );

    async function createNewDocument(openMindMap = false){
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
        titleText:openMindMap ? "New mind map" : "New document",
        descriptionText:openMindMap
            ? "Create a document for your new mind map."
            : "Start a new piece of knowledge.",
        confirmText:"Create"
    });

    if(!title) return;

    const newDocument = createDocument(
        title,
        state.currentWorkspaceId,
        state.currentFolderId
    );

    renderDocuments(state.currentFolderId);

    window.location.href =
        `editor.html?id=${encodeURIComponent(newDocument.id)}${
            openMindMap ? "&mode=mindmap" : ""
        }`;
}

    document.getElementById(
        "createDocumentBtn"
    ).addEventListener(
        "click",
        createNewDocument
    );

    /* Quick Actions */
const quickNewDocument =
    document.getElementById("quickNewDocument");

const quickNewFolder =
    document.getElementById("quickNewFolder");

const quickNewMindMap =
    document.getElementById("quickNewMindMap");

if(quickNewDocument){
    quickNewDocument.addEventListener(
        "click",
        () => {
            createNewDocument(false);
        }
    );
}

if(quickNewFolder){
    quickNewFolder.addEventListener(
        "click",
        () => {
            document.getElementById(
                "addFolderBtn"
            ).click();
        }
    );
}

if(quickNewMindMap){
    quickNewMindMap.addEventListener(
        "click",
        () => {
            createNewDocument(true);
        }
    );
}

    const documentSearch =
        document.getElementById(
            "documentSearch"
        );

    documentSearch.addEventListener(
        "input",
        event => {
            const query =
                event.target.value
                    .trim()
                    .toLowerCase();

            const documents =
                state.documents.filter(
                    document =>
                        !document.deletedAt &&
                        (
                            document.title
                                .toLowerCase()
                                .includes(query) ||
                            document.tags.some(
                                tag =>
                                    tag
                                        .toLowerCase()
                                        .includes(query)
                            )
                        )
                );

            renderDocuments(
                state.currentFolderId,
                documents
            );
        }
    );

    window.showingFavorites = false;
    window.showingRecent = false;

    const favoritesFilterBtn =
        document.getElementById(
            "favoritesFilterBtn"
        );

    const recentFilterBtn =
        document.getElementById(
            "recentFilterBtn"
        );

    const documentFilterInstruction =
        document.getElementById(
            "documentFilterInstruction"
        );

    function updateDocumentFilters(){
        const hasFolder =
            state.currentFolderId !== null;

        favoritesFilterBtn.style.display =
            hasFolder
                ? ""
                : "none";

        recentFilterBtn.style.display =
            hasFolder
                ? ""
                : "none";

        documentFilterInstruction.style.display =
            hasFolder
                ? "none"
                : "inline-block";
    }

    updateDocumentFilters();

    window.addEventListener(
        "folderSelectionChanged",
        updateDocumentFilters
    );

    favoritesFilterBtn.addEventListener(
        "click",
        () => {
            window.showingFavorites =
                !window.showingFavorites;

            window.showingRecent = false;

            recentFilterBtn.classList.remove(
                "active"
            );

            if(window.showingFavorites){
                const favoriteDocuments =
                    state.documents.filter(
                        document =>
                            document.folderId ===
                                state.currentFolderId &&
                            document.favorite &&
                            !document.deletedAt
                    );

                renderDocuments(
                    state.currentFolderId,
                    favoriteDocuments
                );

                favoritesFilterBtn.classList.add(
                    "active"
                );
            }else{
                renderDocuments(
                    state.currentFolderId
                );

                favoritesFilterBtn.classList.remove(
                    "active"
                );
            }
        }
    );

    recentFilterBtn.addEventListener(
        "click",
        () => {
            window.showingRecent =
                !window.showingRecent;

            window.showingFavorites = false;

            favoritesFilterBtn.classList.remove(
                "active"
            );

            if(window.showingRecent){
                const recentDocuments =
                    [...state.documents].filter(
                        document =>
                            document.folderId ===
                                state.currentFolderId &&
                            document.lastOpenedAt &&
                            !document.deletedAt
                    );

                renderDocuments(
                    state.currentFolderId,
                    recentDocuments
                );

                recentFilterBtn.classList.add(
                    "active"
                );
            }else{
                renderDocuments(
                    state.currentFolderId
                );

                recentFilterBtn.classList.remove(
                    "active"
                );
            }
        }
    );

    const viewAllDocumentsBtn =
        document.getElementById(
            "viewAllDocumentsBtn"
        );

    if(viewAllDocumentsBtn){
        viewAllDocumentsBtn.addEventListener(
            "click",
            () => {
                window.location.href =
                    "documents.html";
            }
        );
    }
}

const profileBtn =
    document.getElementById("profileBtn");

if(profileBtn){
    profileBtn.addEventListener(
        "click",
        () => {
            logoutUser();

            window.location.href =
                "login.html";
        }
    );
}