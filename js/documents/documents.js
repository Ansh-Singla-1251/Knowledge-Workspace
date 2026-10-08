import state from "../state/store.js";
import {icons} from "../utils/icons.js";
import {loadState,openDatabase} from "../storage/database.js";

let currentFilter = "all";
let currentQuery = "";

export function renderLibraryDocuments(
    documents,
    gridId = "documentLibraryGrid"
){
    const grid =
        document.getElementById(gridId);

    const count =
        document.getElementById("documentCount");

    if(!grid){
        return;
    }

    if(count){
        count.textContent =
            documents.length;
    }

    grid.innerHTML = "";

    if(documents.length === 0){
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    ${icons.document}
                </div>

                <h3>
                    No documents found
                </h3>

                <p>
                    Try a different search or filter.
                </p>
            </div>
        `;

        return;
    }

    documents.forEach(doc => {
        const workspace =
            state.workspaces.find(
                workspace =>
                    workspace.id === doc.workspaceId
            );

        const folder =
            state.folders.find(
                folder =>
                    folder.id === doc.folderId
            );

        const tags =
            Array.isArray(doc.tags)
                ? doc.tags
                : [];

        const card =
            document.createElement("div");

        card.classList.add(
            "library-document-card"
        );

        card.dataset.id =
            doc.id;

        card.innerHTML = `
            <div class="library-document-icon">
                ${icons.document}
            </div>

            <div class="library-document-name">
                ${doc.title}
            </div>

            <div class="library-document-blocks">
                ${doc.blocks.length} blocks
            </div>

            <div class="library-document-context">

                <div>
                    Workspace:
                    <strong>
                        ${workspace?.name || "Unknown"}
                    </strong>
                </div>

                <div>
                    Folder:
                    <strong>
                        ${folder?.name || "Unfiled"}
                    </strong>
                </div>

            </div>

            ${
                tags.length > 0
                    ? `
                        <div class="library-document-tags">
                            ${tags
                                .map(
                                    tag =>
                                        `<span>#${tag}</span>`
                                )
                                .join("")}
                        </div>
                    `
                    : ""
            }
        `;

        card.addEventListener(
            "click",
            () => {
                window.location.href =
                    `editor.html?id=${encodeURIComponent(doc.id)}`;
            }
        );

        grid.appendChild(card);
    });
}

function getFilteredDocuments(){
    let documents =
        state.documents.filter(
            document =>
                !document.deletedAt
        );

    if(currentFilter === "favorites"){
        documents =
            documents.filter(
                document =>
                    document.favorite === true
            );
    }

    if(currentFilter === "recent"){
        documents =
            [...state.documents]
                .filter(
                    document =>
                        document.lastOpenedAt &&
                        !document.deletedAt
                )
                .sort(
                    (a,b) =>
                        new Date(b.lastOpenedAt) -
                        new Date(a.lastOpenedAt)
                );
    }

    if(currentQuery){
        documents =
            documents.filter(document => {

                const title =
                    document.title
                        .toLowerCase();

                const tags =
                    Array.isArray(document.tags)
                        ? document.tags
                            .join(" ")
                            .toLowerCase()
                        : "";

                return (
                    title.includes(currentQuery) ||
                    tags.includes(currentQuery)
                );
            });
    }

    return documents;
}

function updateLibrary(){
    renderLibraryDocuments(
        getFilteredDocuments()
    );
}

function setupFilters(){

    const searchInput =
        document.getElementById("librarySearch");

    if(!searchInput){
        return;
    }

    searchInput.addEventListener(
        "input",
        event => {

            currentQuery =
                event.target.value
                    .trim()
                    .toLowerCase();

            updateLibrary();
        }
    );

    const filterButtons =
        document.querySelectorAll(
            ".library-filter"
        );

    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    item =>
                        item.classList.remove("active")
                );

                button.classList.add("active");

                const filter =
                    button.textContent
                        .trim()
                        .toLowerCase();

                currentFilter =
                    filter === "favorites"
                        ? "favorites"
                        : filter === "recent"
                            ? "recent"
                            : "all";

                updateLibrary();
            }
        );

    });
}

async function refreshLibraryState(){
    await openDatabase();
    const savedState =
        await loadState();

    state.workspaces =
        savedState.workspaces;

    state.folders =
        savedState.folders;

    state.documents =
        savedState.documents;

    updateLibrary();
}

if(document.getElementById("documentLibraryGrid")){

    setupFilters();

    refreshLibraryState();

    window.addEventListener(
        "knowledgeWorkspaceUpdate",
        refreshLibraryState
    );

    window.addEventListener(
        "storage",
        event => {

            if(
                event.key !==
                "knowledgeWorkspaceUpdate"
            ){
                return;
            }

            refreshLibraryState();
        }
    );

}