import state from "../state/store.js";
import {
    restoreDocument,
    permanentlyDeleteDocument
} from "../document/document.js";
import {requestConfirmation} from "../utils/modal.js";
import {showToast} from "../utils/toast.js";

const trashGrid = document.getElementById("trashGrid");

export function renderTrash(){
    const documents = state.documents.filter(
        document => document.deletedAt
    );

    trashGrid.innerHTML = "";

    if(documents.length === 0){
        trashGrid.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🗑️
                </div>

                <h3>
                    Trash is empty
                </h3>

                <p>
                    Deleted documents will appear here.
                </p>

            </div>
        `;

        return;
    }

    documents.forEach(deletedDocument => {

        const card = document.createElement("article");
        card.className = "document-card";

        const deletedDate =
            new Date(deletedDocument.deletedAt).toLocaleDateString(
                "en-IN",
                {
                    day:"numeric",
                    month:"short",
                    year:"numeric"
                }
            );

        card.innerHTML = `
            <div class="document-card-content">

                <h3>
                    ${deletedDocument.title}
                </h3>

                <p>
                    Deleted ${deletedDate}
                </p>

                <div class="document-card-actions">

                    <button
                        class="secondary-btn restore-document-btn"
                        type="button"
                    >
                        Restore
                    </button>

                    <button
                        class="secondary-btn delete-permanent-btn"
                        type="button"
                    >
                        Delete permanently
                    </button>

                </div>

            </div>
        `;

        const restoreBtn =
            card.querySelector(".restore-document-btn");

        const deleteBtn =
            card.querySelector(".delete-permanent-btn");

        restoreBtn.addEventListener("click",() => {
            restoreDocument(deletedDocument.id);

            renderTrash();

            window.dispatchEvent(
                new CustomEvent("knowledgeWorkspaceUpdate")
            );

            showToast("Document restored.");
        });

        deleteBtn.addEventListener("click",async () => {
            const confirmed = await requestConfirmation({
                titleText:"Delete permanently?",
                descriptionText:
                    `"${deletedDocument.title}" will be permanently removed and cannot be restored.`,
                confirmText:"Delete permanently"
            });

            if(!confirmed){
                return;
            }

            permanentlyDeleteDocument(
                deletedDocument.id
            );

            renderTrash();

            window.dispatchEvent(
                new CustomEvent("knowledgeWorkspaceUpdate")
            );

            showToast("Document permanently deleted.");
        });

        trashGrid.appendChild(card);
    });
}