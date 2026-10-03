import state from "../state/store.js";
import {generateId} from "../utils/id.js";
import {persistState} from "../storage/storage.js";

export function createDocument(title,workspaceId,folderId = null){
    const document = {
        id: generateId("document"),
        title: title,
        workspaceId: workspaceId,
        folderId: folderId,
        blocks: [],
        tags: [],
        links: [],
        favorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    state.documents.push(document);
    persistState();

    return document;
}

export function getFolderDocuments(folderId){
    return state.documents.filter(
        document => document.folderId === folderId
    );
}

export function selectDocument(documentId){
    const document = state.documents.find(
        document => document.id === documentId
    );

    if(!document) return;

    state.currentDocumentId = documentId;
    document.lastOpenedAt = new Date();

    persistState();

    return document;
}

export function updateDocument(documentId,newTitle){
    const document = state.documents.find(
        document => document.id === documentId
    );

    if(!document) return;

    document.title = newTitle;
    document.updatedAt = new Date();

    persistState();

    return document;
}

export function deleteDocument(documentId){
    const documentIndex = state.documents.findIndex(
        document => document.id === documentId
    );

    if(documentIndex === -1) return;

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

    if(!document || !targetDocument) return;

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

    if(!document || !document.links) return;

    document.links = document.links.filter(
        id => id !== targetDocumentId
    );

    document.updatedAt = new Date();

    persistState();
}

export function getBacklinks(documentId){
    return state.documents.filter(
        document =>
            document.links &&
            document.links.includes(documentId)
    );
}