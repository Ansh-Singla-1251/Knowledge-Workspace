import state from "../state/store.js";
import {generateId} from "../utils/id.js";
import {persistState} from "../storage/storage.js";
import {deleteAttachment} from "./attachment.js";
export function createDocument(title,workspaceId,folderId = null){
    const document = {
        id: generateId("document"),
        title: title,
        workspaceId: workspaceId,
        folderId: folderId,
        blocks: [],
        tags: [],
        links: [],
        attachments:[],
        favorite: false,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    state.documents.push(document);
    persistState();

    return document;
}

export function getFolderDocuments(folderId){
    return state.documents.filter(
        document =>
            document.folderId === folderId &&
            !document.deletedAt
    );
}

export function getTrashDocuments(){
    return state.documents.filter(
        document => document.deletedAt
    );
}

export function selectDocument(documentId){
    const document = state.documents.find(
        document => document.id === documentId
    );

    if(!document || document.deletedAt){
        return;
    }

    state.currentDocumentId = documentId;
    document.lastOpenedAt = new Date();

    persistState();

    return document;
}

export function updateDocument(documentId,newTitle){
    const document = state.documents.find(
        document => document.id === documentId
    );

    if(!document || document.deletedAt){
        return;
    }

    document.title = newTitle;
    document.updatedAt = new Date();

    persistState();

    return document;
}

export function deleteDocument(documentId){
    const document = state.documents.find(
        document => document.id === documentId
    );

    if(!document || document.deletedAt){
        return;
    }

    document.deletedAt = new Date();
    document.updatedAt = new Date();

    if(state.currentDocumentId === documentId){
        state.currentDocumentId = null;
    }

    persistState();
}

export function restoreDocument(documentId){
    const document = state.documents.find(
        document => document.id === documentId
    );

    if(!document || !document.deletedAt){
        return;
    }

    document.deletedAt = null;
    document.updatedAt = new Date();

    persistState();

    return document;
}

export function permanentlyDeleteDocument(documentId){
    const documentIndex = state.documents.findIndex(
        document =>
            document.id === documentId &&
            document.deletedAt
    );

    if(documentIndex === -1){
        return;
    }

    const document =
        state.documents[documentIndex];

    if(document.attachments){
        document.attachments.forEach(
            attachmentId => {
                deleteAttachment(
                    attachmentId,
                    false
                );
            }
        );
    }

    state.documents.splice(documentIndex,1);

    if(state.currentDocumentId === documentId){
        state.currentDocumentId = null;
    }

    persistState();
}

export function linkDocuments(documentId,targetDocumentId){
    const document = state.documents.find(
        document => document.id === documentId
    );

    const targetDocument = state.documents.find(
        document => document.id === targetDocumentId
    );

    if(
        !document ||
        !targetDocument ||
        document.deletedAt ||
        targetDocument.deletedAt
    ){
        return;
    }

    if(!document.links){
        document.links = [];
    }

    if(documentId === targetDocumentId){
        return;
    }

    if(document.links.includes(targetDocumentId)){
        return;
    }

    document.links.push(targetDocumentId);
    document.updatedAt = new Date();

    persistState();
}

export function unlinkDocuments(documentId,targetDocumentId){
    const document = state.documents.find(
        document => document.id === documentId
    );

    if(!document || !document.links || document.deletedAt){
        return;
    }

    document.links = document.links.filter(
        id => id !== targetDocumentId
    );

    document.updatedAt = new Date();

    persistState();
}

export function getBacklinks(documentId){
    return state.documents.filter(
        document =>
            !document.deletedAt &&
            document.links &&
            document.links.includes(documentId)
    );
}

export function cleanupTrash(){
    const retentionPeriod = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    state.documents = state.documents.filter(document => {
        if(!document.deletedAt){
            return true;
        }

        const deletedTime = new Date(document.deletedAt).getTime();

        return now - deletedTime < retentionPeriod;
    });

    persistState();
}