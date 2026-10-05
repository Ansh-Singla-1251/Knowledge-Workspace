import {generateId} from "../utils/id.js";

export function createMindMapBlock(block,content,markUnsaved){
    let data;

    try{
        data = content ? JSON.parse(content) : null;
    }catch(error){
        data = null;
    }

    if(!data){
        data = {
            nodes: [
                {
                    id: generateId("node"),
                    text: "Central Idea",
                    x: 350,
                    y: 210
                }
            ],
            connections: []
        };
    }

    if(!Array.isArray(data.nodes)){
        data.nodes = [];
    }

    if(!Array.isArray(data.connections)){
        data.connections = [];
    }

    block.innerHTML = "";
    block.classList.add("mindmap-editor");

    const toolbar = document.createElement("div");
    toolbar.className = "mindmap-editor-toolbar";

    const addNodeButton = document.createElement("button");
    addNodeButton.type = "button";
    addNodeButton.textContent = "+ Add node";

    const connectButton = document.createElement("button");
    connectButton.type = "button";
    connectButton.textContent = "Connect";

    const deleteNodeButton = document.createElement("button");
    deleteNodeButton.type = "button";
    deleteNodeButton.textContent = "Delete node";

    const zoomOutButton = document.createElement("button");
    zoomOutButton.type = "button";
    zoomOutButton.textContent = "−";

    const zoomResetButton = document.createElement("button");
    zoomResetButton.type = "button";
    zoomResetButton.textContent = "Reset";

    const zoomInButton = document.createElement("button");
    zoomInButton.type = "button";
    zoomInButton.textContent = "+";

    toolbar.appendChild(addNodeButton);
    toolbar.appendChild(connectButton);
    toolbar.appendChild(deleteNodeButton);
    toolbar.appendChild(zoomOutButton);
    toolbar.appendChild(zoomResetButton);
    toolbar.appendChild(zoomInButton);

    const canvas = document.createElement("div");
    canvas.className = "mindmap-editor-canvas";

    const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );

    svg.classList.add("mindmap-editor-svg");
    svg.setAttribute("viewBox","0 0 700 420");

    const linesGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
    );

    const nodesGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
    );

    svg.appendChild(linesGroup);
    svg.appendChild(nodesGroup);

    canvas.appendChild(svg);
    block.appendChild(toolbar);
    block.appendChild(canvas);

    let selectedNode = null;
    let connecting = false;
    let draggingNode = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let panning = false;
    let panStartX = 0;
    let panStartY = 0;

    function save(){
        block.dataset.content = JSON.stringify(data);
        markUnsaved();
    }

    function getSVGPoint(event){
        const point = svg.createSVGPoint();

        point.x = event.clientX;
        point.y = event.clientY;

        const matrix = svg.getScreenCTM();

        if(!matrix){
            return {
                x: event.clientX,
                y: event.clientY
            };
        }

        return point.matrixTransform(
            matrix.inverse()
        );
    }

    function render(){
        linesGroup.innerHTML = "";
        nodesGroup.innerHTML = "";

        data.connections.forEach((connection,index) => {
            const source = data.nodes.find(
                node => node.id === connection.from
            );

            const target = data.nodes.find(
                node => node.id === connection.to
            );

            if(!source || !target){
                return;
            }

            const line = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );

            line.setAttribute("x1",source.x);
            line.setAttribute("y1",source.y);
            line.setAttribute("x2",target.x);
            line.setAttribute("y2",target.y);

            line.dataset.connectionFrom = connection.from;
            line.dataset.connectionTo = connection.to;

            line.classList.add("mindmap-editor-line");

            line.addEventListener("dblclick",event => {
                event.stopPropagation();

                data.connections.splice(index,1);

                save();
                render();
            });

            linesGroup.appendChild(line);
        });

        data.nodes.forEach(node => {
            const group = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "g"
            );

            group.setAttribute(
                "transform",
                `translate(${node.x} ${node.y})`
            );

            group.dataset.nodeId = node.id;
            group.classList.add("mindmap-editor-node");

            if(selectedNode === node.id){
                group.classList.add("selected");
            }

            const rect = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
            );

            rect.setAttribute("x","-60");
            rect.setAttribute("y","-22");
            rect.setAttribute("width","120");
            rect.setAttribute("height","44");
            rect.setAttribute("rx","10");

            const text = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );

            text.textContent =
                node.text.length > 16
                    ? `${node.text.substring(0,16)}…`
                    : node.text;

            text.setAttribute("text-anchor","middle");
            text.setAttribute("y","5");

            group.appendChild(rect);
            group.appendChild(text);

            group.addEventListener("click",event => {
                event.stopPropagation();
                if(connecting){
                    if(
                        selectedNode &&
                        selectedNode !== node.id
                    ){
                        const exists = data.connections.some(
                            connection =>
                                connection.from === selectedNode &&
                                connection.to === node.id
                        );

                        if(!exists){
                            data.connections.push({
                                from: selectedNode,
                                to: node.id
                            });
                        }

                        selectedNode = null;
                        connecting = false;
                        connectButton.textContent = "Connect";

                        save();
                        render();

                        return;
                    }

                    selectedNode = node.id;

                    group.classList.add("selected");

                    return;
                }

                selectedNode = node.id;

                document.querySelectorAll(
                    ".mindmap-editor-node.selected"
                ).forEach(element => {
                    element.classList.remove("selected");
                });

                group.classList.add("selected");
            });

            group.addEventListener("dblclick",event => {
                event.preventDefault();
                event.stopPropagation();

                const input = document.createElement("input");

                input.type = "text";
                input.value = node.text;
                input.className = "mindmap-node-input";

                const canvasRect = canvas.getBoundingClientRect();

                input.style.left =
                    `${node.x / 700 * canvasRect.width - 60}px`;

                input.style.top =
                    `${node.y / 420 * canvasRect.height - 20}px`;

                canvas.appendChild(input);

                input.focus();
                input.select();

                let finished = false;

                function finishEdit(){
                    if(finished){
                        return;
                    }

                    finished = true;

                    const value = input.value.trim();

                    if(value){
                        node.text = value;
                        save();
                    }

                    input.remove();
                    render();
                }

                input.addEventListener("keydown",event => {
                    if(event.key === "Enter"){
                        event.preventDefault();
                        finishEdit();
                    }

                    if(event.key === "Escape"){
                        finished = true;
                        input.remove();
                        render();
                    }
                });

                input.addEventListener("blur",finishEdit);
            });

            group.addEventListener("mousedown",event => {
                if(connecting){
                    return;
                }

                if(event.button !== 0){
                    return;
                }

                event.stopPropagation();

                selectedNode = node.id;
                draggingNode = node;

                const point = getSVGPoint(event);

                dragOffsetX = point.x - node.x;
                dragOffsetY = point.y - node.y;

                group.classList.add("selected");
                group.classList.add("dragging");
            });

            nodesGroup.appendChild(group);
        });
        linesGroup.setAttribute(
            "transform",
            `translate(${offsetX} ${offsetY}) scale(${scale})`
        );

        nodesGroup.setAttribute(
            "transform",
            `translate(${offsetX} ${offsetY}) scale(${scale})`
        );
    }

        window.addEventListener("mousemove",event => {
        if(!draggingNode){
            return;
        }

        const point = getSVGPoint(event);

        draggingNode.x = Math.max(
            70,
            Math.min(630,point.x - dragOffsetX)
        );

        draggingNode.y = Math.max(
            45,
            Math.min(375,point.y - dragOffsetY)
        );

        const nodeGroup = nodesGroup.querySelector(
            `[data-node-id="${draggingNode.id}"]`
        );

        if(nodeGroup){
            nodeGroup.setAttribute(
                "transform",
                `translate(${draggingNode.x} ${draggingNode.y})`
            );
        }

        data.connections.forEach(connection => {
            const source = data.nodes.find(
                node => node.id === connection.from
            );

            const target = data.nodes.find(
                node => node.id === connection.to
            );

            const line = linesGroup.querySelector(
                `[data-connection-from="${connection.from}"][data-connection-to="${connection.to}"]`
            );

            if(!source || !target || !line){
                return;
            }

            line.setAttribute("x1",source.x);
            line.setAttribute("y1",source.y);
            line.setAttribute("x2",target.x);
            line.setAttribute("y2",target.y);
        });
    });

    window.addEventListener("mouseup",() => {
        if(!draggingNode){
            return;
        }

        draggingNode = null;
        save();
    });

    addNodeButton.addEventListener("click",() => {
        data.nodes.push({
            id: generateId("node"),
            text: "New Idea",
            x: 350,
            y: 210
        });

        save();
        render();
    });

    connectButton.addEventListener("click",() => {
        connecting = !connecting;
        selectedNode = null;

        connectButton.textContent =
            connecting
                ? "Select nodes..."
                : "Connect";

        render();
    });

    deleteNodeButton.addEventListener("click",() => {
        if(!selectedNode){
            return;
        }

        data.nodes = data.nodes.filter(
            node => node.id !== selectedNode
        );

        data.connections = data.connections.filter(
            connection =>
                connection.from !== selectedNode &&
                connection.to !== selectedNode
        );

        selectedNode = null;

        save();
        render();
    });
    svg.addEventListener("wheel",event => {
        event.preventDefault();

        const zoom = event.deltaY < 0 ? 1.1 : 0.9;

        scale = Math.max(
            0.6,
            Math.min(2.5,scale * zoom)
        );

        linesGroup.setAttribute(
            "transform",
            `translate(${offsetX} ${offsetY}) scale(${scale})`
        );

        nodesGroup.setAttribute(
            "transform",
            `translate(${offsetX} ${offsetY}) scale(${scale})`
        );
    },{passive:false});

    svg.addEventListener("mousedown",event => {
        if(event.button !== 1){
            return;
        }

        panning = true;
        panStartX = event.clientX - offsetX;
        panStartY = event.clientY - offsetY;

        event.preventDefault();
    });

    window.addEventListener("mousemove",event => {
        if(!panning){
            return;
        }

        offsetX = event.clientX - panStartX;
        offsetY = event.clientY - panStartY;

        linesGroup.setAttribute(
            "transform",
            `translate(${offsetX} ${offsetY}) scale(${scale})`
        );

        nodesGroup.setAttribute(
            "transform",
            `translate(${offsetX} ${offsetY}) scale(${scale})`
        );
    });

    window.addEventListener("mouseup",event => {
        if(event.button === 1){
            panning = false;
        }
    });

    svg.addEventListener("mousedown",event => {
        if(event.button !== 1){
            return;
        }

        panning = true;
        panStartX = event.clientX - offsetX;
        panStartY = event.clientY - offsetY;

        event.preventDefault();
    });

    window.addEventListener("mousemove",event => {
        if(!panning){
            return;
        }

        offsetX = event.clientX - panStartX;
        offsetY = event.clientY - panStartY;

        nodesGroup.setAttribute(
            "transform",
            `translate(${offsetX} ${offsetY}) scale(${scale})`
        );

        linesGroup.setAttribute(
            "transform",
            `translate(${offsetX} ${offsetY}) scale(${scale})`
        );
    });

    window.addEventListener("mouseup",event => {
        if(event.button === 1){
            panning = false;
        }
    });

    zoomInButton.addEventListener("click",() => {
        scale = Math.min(2.5,scale * 1.15);

        linesGroup.setAttribute(
            "transform",
            `translate(${offsetX} ${offsetY}) scale(${scale})`
        );

        nodesGroup.setAttribute(
            "transform",
            `translate(${offsetX} ${offsetY}) scale(${scale})`
        );
    });

    zoomOutButton.addEventListener("click",() => {
        scale = Math.max(0.6,scale * 0.85);

        linesGroup.setAttribute(
            "transform",
            `translate(${offsetX} ${offsetY}) scale(${scale})`
        );

        nodesGroup.setAttribute(
            "transform",
            `translate(${offsetX} ${offsetY}) scale(${scale})`
        );
    });

    zoomResetButton.addEventListener("click",() => {
        scale = 1;
        offsetX = 0;
        offsetY = 0;

        linesGroup.setAttribute(
            "transform",
            `translate(0 0) scale(1)`
        );

        nodesGroup.setAttribute(
            "transform",
            `translate(0 0) scale(1)`
        );
    });
    svg.addEventListener("click",event => {
        if(event.target === svg){
            selectedNode = null;
            render();
        }
    });

    render();

    block.dataset.content = JSON.stringify(data);
}