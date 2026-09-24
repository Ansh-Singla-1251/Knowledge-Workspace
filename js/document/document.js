import state from "../state/store.js";

import {
    generateId
} from "../utils/id.js";


export function createDocument(
    title,
    workspaceId,
    folderId = null
) {

    const document = {

        id: generateId("document"),

        title: title,

        workspaceId: workspaceId,

        folderId: folderId,

        blocks: [],

        tags: [],

        createdAt: new Date(),

        updatedAt: new Date()

    };


    state.documents.push(
        document
    );

    return document;

}


export function getFolderDocuments(
    folderId
) {

    return state.documents.filter(
        document =>
            document.folderId === folderId
    );

}


export function selectDocument(
    documentId
) {

    const document =
        state.documents.find(
            document =>
                document.id === documentId
        );

    if (!document) {
        return;
    }

    state.currentDocumentId =
        documentId;

    return document;

}


export function updateDocument(
    documentId,
    newTitle
) {

    const document =
        state.documents.find(
            document =>
                document.id === documentId
        );

    if (!document) {
        return;
    }

    document.title =
        newTitle;

    document.updatedAt =
        new Date();

    return document;

}


export function deleteDocument(
    documentId
) {

    const documentIndex =
        state.documents.findIndex(
            document =>
                document.id === documentId
        );

    if (documentIndex === -1) {
        return;
    }


    state.documents.splice(
        documentIndex,
        1
    );


    if (
        state.currentDocumentId ===
        documentId
    ) {

        state.currentDocumentId =
            null;

    }

}