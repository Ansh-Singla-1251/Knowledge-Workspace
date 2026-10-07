const DB_NAME = "knowledgeWorkspaceDB";
const DB_VERSION = 2;

let db = null;

export function openDatabase() {
    return new Promise((resolve,reject) => {
        const request = indexedDB.open(DB_NAME,DB_VERSION);

        request.onupgradeneeded = event => {
            const database = event.target.result;

            if(!database.objectStoreNames.contains("workspaces")){
                database.createObjectStore("workspaces",{keyPath:"id"});
            }

            if(!database.objectStoreNames.contains("folders")){
                database.createObjectStore("folders",{keyPath:"id"});
            }

            if(!database.objectStoreNames.contains("documents")){
                database.createObjectStore("documents",{keyPath:"id"});
            }
            if(!database.objectStoreNames.contains("attachments")){
                database.createObjectStore(
                    "attachments",
                    {keyPath:"id"}
                );
            }
        };

        request.onsuccess = event => {
            db = event.target.result;
            console.log("IndexedDB opened successfully.");
            resolve(db);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

export function saveState(state) {
    return new Promise((resolve,reject) => {
        if(!db){
            reject(new Error("Database is not open."));
            return;
        }

        const transaction = db.transaction(
            ["workspaces","folders","documents","attachments"],
            "readwrite"
        );

        const workspaces = transaction.objectStore("workspaces");
        const folders = transaction.objectStore("folders");
        const documents = transaction.objectStore("documents");
        const attachments =transaction.objectStore("attachments");
        workspaces.clear();
        folders.clear();
        documents.clear();
        attachments.clear();
        state.workspaces.forEach(workspace => {
            workspaces.put(workspace);
        });

        state.folders.forEach(folder => {
            folders.put(folder);
        });

        state.documents.forEach(document => {
            documents.put(document);
        });
        state.attachments.forEach(attachment => {
            attachments.put(attachment);
        });
        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
}

export function loadState() {
    return new Promise((resolve,reject) => {
        if(!db){
            reject(new Error("Database is not open."));
            return;
        }

        const transaction = db.transaction(
            ["workspaces","folders","documents","attachments"],
            "readonly"
        );

        const workspaces = transaction.objectStore("workspaces").getAll();
        const folders = transaction.objectStore("folders").getAll();
        const documents = transaction.objectStore("documents").getAll();
        const attachments =transaction.objectStore("attachments").getAll();
        transaction.oncomplete = () => {
            resolve({
                workspaces: workspaces.result,
                folders: folders.result,
                documents: documents.result,
                attachments: attachments.result
            });
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
}
export function persistState(state) {
    return saveState(state);
}