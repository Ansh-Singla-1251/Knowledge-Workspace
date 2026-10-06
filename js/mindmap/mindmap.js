import state from "../state/store.js";

const container = document.getElementById("mindmapContainer");

let scale = 1;
let offsetX = 0;
let offsetY = 0;

export function renderMindMap(){
    if(!container) return;

    container.innerHTML = "";

    const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );

    svg.classList.add("mindmap-svg");

    svg.setAttribute("viewBox","0 0 720 480");

    const viewport = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
    );

    viewport.classList.add("mindmap-viewport");

    const nodes = [];
    const nodeMap = new Map();

    const folderWidth = 180;
    const documentWidth = 120;
    const documentGap = 50;
    const folderGap = 80;
    const levelGap = 120;

    const workspaceFolders = new Map();

    state.folders.forEach(folder => {
        if(!workspaceFolders.has(folder.workspaceId)){
            workspaceFolders.set(folder.workspaceId,[]);
        }

        workspaceFolders.get(folder.workspaceId).push(folder);
    });

    state.workspaces.forEach((workspace,index) => {
        const folders = workspaceFolders.get(workspace.id) || [];

        const folderRegions = folders.map(folder => {
            const documents = state.documents.filter(
                document => document.folderId === folder.id
            );

            const documentWidthTotal =
                documents.length > 0
                    ? documents.length * documentWidth +
                    (documents.length - 1) * documentGap
                    : folderWidth;

            return {
                folder,
                documents,
                width: Math.max(folderWidth,documentWidthTotal)
            };
        });

        const totalWidth = folderRegions.reduce(
            (sum,region) => sum + region.width,
            0
        ) + Math.max(0,folderRegions.length - 1) * folderGap;

        let currentX = 360 - totalWidth / 2;

        const workspaceNode = {
            id: workspace.id,
            type: "workspace",
            label: workspace.name,
            x: 360,
            y: 70 + index * 420
        };

        nodes.push(workspaceNode);
        nodeMap.set(workspaceNode.id,workspaceNode);

        folderRegions.forEach(region => {
            const folder = region.folder;
            const folderCenterX =
                currentX + region.width / 2;

            const folderNode = {
                id: folder.id,
                type: "folder",
                label: folder.name,
                x: folderCenterX,
                y: workspaceNode.y + levelGap
            };

            nodes.push(folderNode);
            nodeMap.set(folderNode.id,folderNode);

            const documents = region.documents;

            if(documents.length > 0){
                const documentsTotalWidth =
                    documents.length * documentWidth +
                    (documents.length - 1) * documentGap;

                let documentX =
                    folderCenterX - documentsTotalWidth / 2;

                documents.forEach(document => {
                    const documentNode = {
                        id: document.id,
                        type: "document",
                        label: document.title,
                        x: documentX + documentWidth / 2,
                        y: folderNode.y + levelGap - 15
                    };

                    nodes.push(documentNode);
                    nodeMap.set(documentNode.id,documentNode);

                    documentX += documentWidth + documentGap;
                });
            }

            currentX += region.width + folderGap;
        });
    });

    state.documents.forEach(document => {
        const parent = nodeMap.get(document.folderId);

        if(!parent) return;

        const folderDocuments = state.documents.filter(
            item => item.folderId === document.folderId
        );

        const index = folderDocuments.indexOf(document);

        const node = {
            id: document.id,
            type: "document",
            label: document.title,
            x: parent.x - ((folderDocuments.length - 1) * 85) + index * 170,
            y: parent.y + 105
        };

        nodes.push(node);
        nodeMap.set(node.id,node);
    });  

    const linesGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
    );

    linesGroup.classList.add("mindmap-lines");

    state.folders.forEach(folder => {
        const parent = nodeMap.get(folder.workspaceId);
        const child = nodeMap.get(folder.id);

        if(!parent || !child) return;

        const line = createConnection(parent,child);

        linesGroup.appendChild(line);
    });

    state.documents.forEach(document => {
        const parent = nodeMap.get(document.folderId);
        const child = nodeMap.get(document.id);

        if(!parent || !child) return;

        const line = createConnection(parent,child);

        linesGroup.appendChild(line);
    });

    state.documents.forEach(document => {
        if(!Array.isArray(document.links)){
            return;
        }

        document.links.forEach(linkId => {
            const source = nodeMap.get(document.id);
            const target = nodeMap.get(linkId);

            if(!source || !target){
                return;
            }

            const line = createConnection(source,target,true);

            linesGroup.appendChild(line);
        });
    });

    viewport.appendChild(linesGroup);

    nodes.forEach(node => {
        let group;

        if(node.type === "workspace"){
            group = createWorkspaceCard(node);
        }else if(node.type === "folder"){
            group = createFolderCard(node);
        }else{
            group = createDocumentCard(node);
        }

        group.setAttribute(
            "transform",
            `translate(${node.x} ${node.y})`
        );

        group.classList.add("mindmap-node");
        group.classList.add(`mindmap-${node.type}`);

        if(node.type === "document"){
            group.dataset.documentId = node.id;
            group.addEventListener("mouseenter",() => {
                document.querySelectorAll(".mindmap-link").forEach(line => {
                    const from = line.getAttribute("data-from");
                    const to = line.getAttribute("data-to");
                    if(from === node.id || to === node.id){
                        line.classList.add("mindmap-link-active");
                    }
                });
            });

            group.addEventListener("mouseleave",() => {
                document.querySelectorAll(".mindmap-link").forEach(line => {
                    line.classList.remove("mindmap-link-active");
                });
            });

            group.addEventListener("dblclick",event => {
                event.preventDefault();
                event.stopPropagation();

                window.location.assign(
                    `editor.html?id=${encodeURIComponent(node.id)}`
                );
            });
        }

        viewport.appendChild(group);
    });

    svg.appendChild(viewport);
    container.appendChild(svg);
    const legend = document.createElement("div");
    legend.className = "mindmap-legend";

    legend.innerHTML = `
        <span>
            <i class="mindmap-legend-line hierarchy"></i>
            Structure
        </span>
        <span>
            <i class="mindmap-legend-line relationship"></i>
            Knowledge Link
        </span>
    `;

    container.appendChild(legend);
    fitMindMap(svg,viewport);

    enableZoomAndPan(svg,viewport);
}

function createConnection(source,target,isLink = false){
    const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    );

    const middleX = (source.x + target.x) / 2;

    const d = `
        M ${source.x} ${source.y}
        C ${middleX} ${source.y},
          ${middleX} ${target.y},
          ${target.x} ${target.y}
    `;

    path.setAttribute("d",d);

    path.classList.add("mindmap-line");
    
    if(isLink){
        path.classList.add("mindmap-link");

        path.setAttribute("data-from",source.id);
        path.setAttribute("data-to",target.id);

        path.addEventListener("mouseenter",() => {
            path.classList.add("mindmap-link-active");

            document.querySelectorAll(".mindmap-node").forEach(node => {
                if(
                    node.dataset.documentId === source.id ||
                    node.dataset.documentId === target.id
                ){
                    node.classList.add("mindmap-node-active");
                }
            });
        });

        path.addEventListener("mouseleave",() => {
            path.classList.remove("mindmap-link-active");

            document.querySelectorAll(".mindmap-node").forEach(node => {
                node.classList.remove("mindmap-node-active");
            });
        });
    }

    return path;
}

function createWorkspaceCard(node){
    const group = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
    );

    const card = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
    );

    card.setAttribute("x","-90");
    card.setAttribute("y","-32");
    card.setAttribute("width","180");
    card.setAttribute("height","64");
    card.setAttribute("rx","17");

    card.classList.add("mindmap-card");

    const eyebrow = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
    );

    eyebrow.textContent = "WORKSPACE";
    eyebrow.setAttribute("text-anchor","middle");
    eyebrow.setAttribute("y","-6");

    eyebrow.classList.add("mindmap-eyebrow");

    const title = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
    );

    title.textContent = node.label;
    title.setAttribute("text-anchor","middle");
    title.setAttribute("y","15");

    title.classList.add("mindmap-title");

    group.appendChild(card);
    group.appendChild(eyebrow);
    group.appendChild(title);

    return group;
}

function createFolderCard(node){
    const group = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
    );

    const card = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
    );

    card.setAttribute("x","-75");
    card.setAttribute("y","-27");
    card.setAttribute("width","150");
    card.setAttribute("height","54");
    card.setAttribute("rx","15");

    card.classList.add("mindmap-card");

    const title = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
    );

    title.textContent = node.label;
    title.setAttribute("text-anchor","middle");
    title.setAttribute("y","5");

    title.classList.add("mindmap-card-title");

    group.appendChild(card);
    group.appendChild(title);

    return group;
}

function createDocumentCard(node){
    const group = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
    );

    const card = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
    );

    card.setAttribute("x","-60");
    card.setAttribute("y","-22");
    card.setAttribute("width","120");
    card.setAttribute("height","44");
    card.setAttribute("rx","12");

    card.classList.add("mindmap-card");

    const title = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
    );

    title.textContent =
        node.label.length > 15
            ? `${node.label.substring(0,15)}…`
            : node.label;

    title.setAttribute("text-anchor","middle");
    title.setAttribute("y","4");

    title.classList.add("mindmap-card-title");

    group.appendChild(card);
    group.appendChild(title);

    return group;
}

function enableZoomAndPan(svg,viewport){
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    svg.addEventListener("wheel",event => {
        event.preventDefault();

        const direction = event.deltaY > 0 ? -1 : 1;

        scale += direction * 0.08;

        scale = Math.max(
            0.5,
            Math.min(2.5,scale)
        );

        updateViewport(viewport);
    },{passive:false});

    svg.addEventListener("mousedown",event => {
        if(event.target.closest(".mindmap-node")){
            return;
        }

        isDragging = true;

        startX = event.clientX - offsetX;
        startY = event.clientY - offsetY;

        svg.classList.add("dragging");
    });

    window.addEventListener("mousemove",event => {
        if(!isDragging){
            return;
        }

        offsetX = event.clientX - startX;
        offsetY = event.clientY - startY;

        updateViewport(viewport);
    });

    window.addEventListener("mouseup",() => {
        isDragging = false;
        svg.classList.remove("dragging");
    });
}

function updateViewport(viewport){
    viewport.setAttribute(
        "transform",
        `translate(${offsetX} ${offsetY}) scale(${scale})`
    );
}

function fitMindMap(svg,viewport){
    const bounds = viewport.getBBox();

    if(!bounds.width || !bounds.height){
        return;
    }

    const padding = 50;
    const viewBoxWidth = 720;
    const viewBoxHeight = 480;

    scale = Math.min(
        (viewBoxWidth - padding * 2) / bounds.width,
        (viewBoxHeight - padding * 2) / bounds.height,
        1
    );

    offsetX =
        viewBoxWidth / 2 -
        (bounds.x + bounds.width / 2) * scale;

    offsetY =
        viewBoxHeight / 2 -
        (bounds.y + bounds.height / 2) * scale;

    updateViewport(viewport);
}