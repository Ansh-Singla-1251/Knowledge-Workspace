import state from "../state/store.js";
import {generateId} from "../utils/id.js";
import {persistState} from "../storage/storage.js";

export function addAttachment(documentId,file){
    const document = state.documents.find(
        document => document.id === documentId
    );

    if(!document || document.deletedAt){
        return;
    }

    const attachment = {
        id: generateId("attachment"),
        documentId: documentId,
        name: file.name,
        type: file.type,
        size: file.size,
        data: file,
        createdAt: new Date()
    };

    if(!state.attachments){
        state.attachments = [];
    }

    state.attachments.push(attachment);

    if(!document.attachments){
        document.attachments = [];
    }

    document.attachments.push(attachment.id);
    document.updatedAt = new Date();

    persistState();

    return attachment;
}

export function getDocumentAttachments(documentId){
    return (state.attachments || []).filter(
        attachment =>
            attachment.documentId === documentId
    );
}

export function deleteAttachment(attachmentId,shouldPersist = true){
    const index = (state.attachments || []).findIndex(
        attachment =>
            attachment.id === attachmentId
    );

    if(index === -1){
        return;
    }

    const attachment =
        state.attachments[index];

    const document = state.documents.find(
        document =>
            document.id === attachment.documentId
    );

    if(document && document.attachments){
        document.attachments =
            document.attachments.filter(
                id => id !== attachmentId
            );
    }

    state.attachments.splice(index,1);

    if(shouldPersist){
        persistState();
    }
}