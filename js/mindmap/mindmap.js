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

    state.workspaces.forEach((workspace,index) => {
        const node = {
            id: workspace.id,
            type: "workspace",
            label: workspace.name,
            x: 360,
            y: 70 + index * 140
        };

        nodes.push(node);
        nodeMap.set(node.id,node);
    });

    state.folders.forEach(folder => {
        const parent = nodeMap.get(folder.workspaceId);

        if(!parent) return;

        const workspaceFolders = state.folders.filter(
            item => item.workspaceId === folder.workspaceId
        );

        const index = workspaceFolders.indexOf(folder);

        const node = {
            id: folder.id,
            type: "folder",
            label: folder.name,
            x: parent.x - 180 + index * 180,
            y: parent.y + 120
        };

        nodes.push(node);
        nodeMap.set(node.id,node);
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
            x: parent.x - 180 + index * 120
                ,
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
    updateViewport(viewport);

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

        path.addEventListener("mouseenter",() => {
            path.classList.add("mindmap-link-active");
        });

        path.addEventListener("mouseleave",() => {
            path.classList.remove("mindmap-link-active");
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