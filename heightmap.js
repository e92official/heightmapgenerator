document.addEventListener('DOMContentLoaded', async function() {
    console.log("Document loaded");
    const jsPlumbInstance = jsPlumb.getInstance({
        Connector: ['Bezier', { curviness: 50 }],
        Anchors: ['Left', 'Right'],
        Endpoint: 'Dot',
        EndpointStyle: { fill: 'black', radius: 5 }
    });

    jsPlumbInstance.setContainer('editor');

    let nodeIdCounter = 1;
    const nodeSettings = {};
    const nodeCount = {};
    let light, renderer, scene, camera, controls;

    async function fetchNodes() {
        const response = await fetch('./nodes.json');
        return await response.json();
    }

    const nodes = await fetchNodes();

    function updateNodeCount(nodeType, increment) {
        if (!nodeCount[nodeType]) {
            nodeCount[nodeType] = 0;
        }
        nodeCount[nodeType] += increment;
        document.querySelector(`#${nodeType} .badge`).innerText = nodeCount[nodeType];
        console.log(`Updated node count for ${nodeType}: ${nodeCount[nodeType]}`);
    }

    function createNodeElement(id, title) {
        const nodeElement = document.createElement('div');
        nodeElement.classList.add('node');
        nodeElement.id = id;
        nodeElement.innerHTML = `<div class="title">${title}</div>`;
        nodeElement.addEventListener('dblclick', () => openNodeSettings(id));
        console.log(`Created node element with ID: ${id} and title: ${title}`);
        return nodeElement;
    }

    function addNodeToEditor(type, title, params) {
        const nodeId = `${type}-${nodeIdCounter++}`;
        const nodeElement = createNodeElement(nodeId, title);
        nodeElement.style.top = '50px';
        nodeElement.style.left = '50px';

        console.log(`Adding node ${nodeId} at position (50px, 50px)`);

        document.getElementById('editor').appendChild(nodeElement);

        jsPlumbInstance.draggable(nodeElement, {
            containment: 'parent',
            drag: function() {
                document.getElementById('trashBin').style.display = 'block';
                console.log('Drag started, trash bin displayed');
            },
            stop: function(params) {
                checkNodePosition(nodeId);
                document.getElementById('trashBin').style.display = 'none';
                console.log('Drag stopped, trash bin hidden');
            }
        });

        const endpoints = {
            input: { anchor: 'Left', isSource: false, isTarget: true },
            output: { anchor: 'Right', isSource: true, isTarget: false },
            combiner: [
                { anchor: [0, 0.3, -1, 0], isSource: false, isTarget: true },
                { anchor: [0, 0.7, -1, 0], isSource: false, isTarget: true },
                { anchor: 'Right', isSource: true, isTarget: false }
            ]
        };

        const nodeTypeEndpoints = endpoints[type] || [endpoints.input, endpoints.output];

        if (type === 'combiner') {
            nodeTypeEndpoints.forEach(endpoint => {
                jsPlumbInstance.addEndpoint(nodeElement, endpoint);
                console.log(`Added combiner endpoint to node ${nodeId}`);
            });
        } else {
            jsPlumbInstance.addEndpoint(nodeElement, nodeTypeEndpoints[0]);
            jsPlumbInstance.addEndpoint(nodeElement, nodeTypeEndpoints[1]);
            console.log(`Added endpoints to node ${nodeId}`);
        }

        nodeSettings[nodeId] = { type, params };

        nodeElement.addEventListener('dblclick', () => openNodeSettings(nodeId));
        nodeElement.addEventListener('mouseup', () => checkNodePosition(nodeId));

        updateNodeCount(type, 1);
    }

    function checkNodePosition(nodeId) {
        const nodeElement = document.getElementById(nodeId);
        const rect = nodeElement.getBoundingClientRect();
        const editorRect = document.getElementById('editor').getBoundingClientRect();
        const trashBin = document.getElementById('trashBin');

        console.log(`Node ${nodeId} position - top: ${rect.top}, left: ${rect.left}`);

        if (
            rect.bottom > trashBin.getBoundingClientRect().top &&
            rect.top < trashBin.getBoundingClientRect().bottom &&
            rect.right > trashBin.getBoundingClientRect().left &&
            rect.left < trashBin.getBoundingClientRect().right
        ) {
            jsPlumbInstance.remove(nodeElement);
            nodeElement.remove();
            updateNodeCount(nodeSettings[nodeId].type, -1);
            trashBin.style.display = 'none';
            console.log(`Node ${nodeId} removed due to being dropped in trash bin`);
        } else if (rect.bottom > editorRect.bottom || rect.top < editorRect.top || rect.right > editorRect.right || rect.left < editorRect.left) {
            jsPlumbInstance.remove(nodeElement);
            nodeElement.remove();
            updateNodeCount(nodeSettings[nodeId].type, -1);
            console.log(`Node ${nodeId} removed due to out of bounds`);
        }
    }

    nodes.forEach(node => {
        const nodeButton = document.createElement('div');
        nodeButton.classList.add('btn', 'btn-secondary', 'position-relative');
        nodeButton.innerHTML = `${node.title} <span class="badge bg-primary position-absolute top-0 start-100 translate-middle">0</span>`;
        nodeButton.id = node.type;
        nodeButton.addEventListener('click', () => addNodeToEditor(node.type, node.title, node.params));
        document.getElementById('nodeBar').appendChild(nodeButton);
        console.log(`Added node button for ${node.type}`);
    });

    function openNodeSettings(nodeId) {
        const settings = nodeSettings[nodeId];
        const modalContent = document.getElementById('nodeSettingsContent');
        modalContent.innerHTML = '';

        settings.params.forEach(param => {
            const paramDiv = document.createElement('div');
            paramDiv.classList.add('parameter');
            if (param.type === "range") {
                paramDiv.innerHTML = `
                    <label>${param.label}</label>
                    <input class="form-range" type="${param.type}" id="${nodeId}-${param.name}" min="${param.min}" max="${param.max}" step="${param.step}" value="${param.default}">
                    <span id="${nodeId}-${param.name}-value">${param.default}</span>
                `;
                paramDiv.querySelector('input').addEventListener('input', function () {
                    document.getElementById(`${nodeId}-${param.name}-value`).innerText = this.value;
                });
            } else {
                paramDiv.innerHTML = `
                    <label>${param.label}</label>
                    <input class="form-control" type="${param.type}" id="${nodeId}-${param.name}" value="${param.default}">
                `;
            }
            modalContent.appendChild(paramDiv);
            console.log(`Added parameter ${param.name} for node ${nodeId}`);
        });

        const modal = new bootstrap.Modal(document.getElementById('nodeSettingsModal'));
        document.getElementById('saveNodeSettings').onclick = () => saveNodeSettings(nodeId);
        modal.show();
        console.log(`Opened settings modal for node ${nodeId}`);
    }

    function saveNodeSettings(nodeId) {
        const settings = nodeSettings[nodeId];
        settings.params.forEach(param => {
            const inputElement = document.getElementById(`${nodeId}-${param.name}`);
            param.default = inputElement.value;
            console.log(`Saved parameter ${param.name} with value ${param.default} for node ${nodeId}`);
        });
        // Close modal after saving settings
        const modal = bootstrap.Modal.getInstance(document.getElementById('nodeSettingsModal'));
        modal.hide();
    }

    function determineNodeOrder(connections) {
        const nodeOrder = [];
        const visited = new Set();

        function visit(node) {
            if (!visited.has(node)) {
                visited.add(node);
                connections.filter(conn => conn.sourceId === node)
                    .forEach(conn => visit(conn.targetId));
                nodeOrder.push(node);
            }
        }

        const inputNode = 'input';
        visit(inputNode);
        console.log(`Determined node order: ${nodeOrder}`);
        return nodeOrder;
    }

    function createHeightmap(width, height) {
        const connectedNodes = jsPlumbInstance.getAllConnections();
        console.log(`Connected nodes: ${connectedNodes.map(conn => `${conn.sourceId} -> ${conn.targetId}`).join(', ')}`);
        
        const nodeOrder = determineNodeOrder(connectedNodes);
        const nodeParams = {};

        nodeOrder.forEach(nodeId => {
            const element = document.getElementById(nodeId);
            if (element && nodeSettings[nodeId]) {
                nodeParams[nodeId] = {};
                nodeSettings[nodeId].params.forEach(param => {
                    nodeParams[nodeId][param.name] = param.default;
                    console.log(`Node ${nodeId} parameter ${param.name} value: ${param.default}`);
                });
            }
        });

        let heightmap = initializeHeightmap(width, height);

        console.log('Initial heightmap:', heightmap);

        nodeOrder.forEach(nodeId => {
            if (nodeSettings[nodeId]) {
                const nodeType = nodeSettings[nodeId].type;
                const params = nodeParams[nodeId];
                console.log(`Applying node ${nodeId} of type ${nodeType} with params ${JSON.stringify(params)}`);
                switch (nodeType) {
                    case 'perlinNoise':
                        applyPerlinNoise(heightmap, width, height, params);
                        break;
                    case 'fractalNoise':
                        applyFractalNoise(heightmap, width, height, params);
                        break;
                    case 'river':
                        addRiver(heightmap, width, height, params);
                        break;
                    case 'erosion':
                        applyErosion(heightmap, width, height, params);
                        break;
                    case 'ridge':
                        addRidge(heightmap, width, height, params);
                        break;
                    case 'thermalWeathering':
                        applyThermalWeathering(heightmap, width, height, params);
                        break;
                    case 'voronoi':
                        applyVoronoi(heightmap, width, height, params);
                        break;
                    case 'terrace':
                        applyTerraces(heightmap, width, height, params);
                        break;
                    case 'valley':
                        addValley(heightmap, width, height, params);
                        break;
                    case 'mountain':
                        addMountain(heightmap, width, height, params);
                        break;
                    case 'hydraulicErosion':
                        applyHydraulicErosion(heightmap, width, height, params);
                        break;
                    case 'lake':
                        addLake(heightmap, width, height, params);
                        break;
                    case 'combiner':
                        let additionalHeightmap = initializeHeightmap(width, height);
                        applyCombiner(heightmap, additionalHeightmap, width, height, params);
                        break;
                    case 'coastErosion':
                        applyCoastErosion(heightmap, width, height, params);
                        break;
                    case 'curves':
                        applyCurves(heightmap, width, height, params);
                        break;
                    case 'vegetation':
                        addVegetation(heightmap, width, height, params);
                        break;
                    case 'texture':
                        applyTexture(heightmap, width, height, params);
                        break;
                    default:
                        console.error(`Unknown node type: ${nodeType}`);
                }
                console.log(`Heightmap after applying node ${nodeId} of type ${nodeType}:`, heightmap);
            }
        });

        console.log('Heightmap creation complete');
        return heightmap;
    }

    function initializeHeightmap(width, height) {
        const heightmap = Array.from({ length: height }, () => Array(width).fill(0.5));
        console.log(`Initialized flat heightmap of size ${width}x${height}`, heightmap);
        return heightmap;
    }

    function drawHeightmap(ctx, heightmap, width, height) {
        const imageData = ctx.createImageData(width, height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const value = Math.floor(heightmap[y][x] * 255);
                const index = (y * width + x) * 4;
                imageData.data[index] = value;
                imageData.data[index + 1] = value;
                imageData.data[index + 2] = value;
                imageData.data[index + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        console.log('Heightmap drawn on canvas');
    }

    function generateTexture(heightmap, width, height) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        const imageData = ctx.createImageData(width, height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const value = heightmap[y][x];
                const index = (y * width + x) * 4;

                if (value < 0.3) {
                    // Water
                    imageData.data[index] = 0;
                    imageData.data[index + 1] = 0;
                    imageData.data[index + 2] = 255;
                } else if (value < 0.4) {
                    // Beach
                    imageData.data[index] = 237;
                    imageData.data[index + 1] = 201;
                    imageData.data[index + 2] = 175;
                } else if (value < 0.6) {
                    // Grass
                    imageData.data[index] = 34;
                    imageData.data[index + 1] = 139;
                    imageData.data[index + 2] = 34;
                } else if (value < 0.8) {
                    // Mountain
                    imageData.data[index] = 139;
                    imageData.data[index + 1] = 69;
                    imageData.data[index + 2] = 19;
                } else {
                    // Snow
                    imageData.data[index] = 255;
                    imageData.data[index + 1] = 250;
                    imageData.data[index + 2] = 250;
                }

                imageData.data[index + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);

        return new THREE.CanvasTexture(canvas);
    }

    function render3DHeightmap(heightmap, width, height) {
        if (renderer) {
            renderer.dispose();
            renderer.forceContextLoss();
            renderer.domElement = null;
            renderer = null;
        }

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true; // Enable shadow maps
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
        document.getElementById('3dView').innerHTML = '';
        document.getElementById('3dView').appendChild(renderer.domElement);

        const geometry = new THREE.PlaneGeometry(100, 100, width - 1, height - 1);
        const vertices = geometry.attributes.position.array;
        for (let i = 0, j = 0; i < vertices.length; i += 3, j++) {
            vertices[i + 2] = heightmap[Math.floor(j / width)][j % width] * 10;
        }
        geometry.computeVertexNormals();

        const texture = generateTexture(heightmap, width, height);
        const material = new THREE.MeshLambertMaterial({ map: texture });

        const plane = new THREE.Mesh(geometry, material);
        plane.receiveShadow = true; // Plane receives shadows
        scene.add(plane);

        light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 7.5).normalize();
        light.castShadow = true; // Light casts shadows
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
        scene.add(ambientLight);

        camera.position.z = 100;
        camera.position.y = -100;
        camera.rotation.x = Math.PI / 4;

        controls = new THREE.OrbitControls(camera, renderer.domElement);

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
            controls.update();
        }
        animate();
        console.log('3D heightmap rendered');
    }

    document.getElementById('lightIntensitySlider').addEventListener('input', function() {
        const intensity = parseFloat(this.value);
        light.intensity = intensity;
        console.log(`Light intensity adjusted to ${intensity}`);
    });

    function exportHeightmapAsPNG() {
        const canvas = document.getElementById('heightmapCanvas');
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'heightmap.png';
        link.click();
        console.log('Heightmap exported as PNG');
    }

    function exportHeightmapAsRAW() {
        const canvas = document.getElementById('heightmapCanvas');
        const width = canvas.width;
        const height = canvas.height;
        const imageData = canvas.getContext('2d').getImageData(0, 0, width, height).data;
        const rawData = new Uint16Array(width * height);

        for (let i = 0; i < width * height; i++) {
            rawData[i] = (imageData[i * 4] << 8) | imageData[i * 4];
        }

        const blob = new Blob([rawData], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'heightmap.r16';
        link.click();
        console.log('Heightmap exported as RAW');
    }

    document.getElementById('generate3DButton').addEventListener('click', generateHeightmapAndView);
    document.getElementById('exportPNG').addEventListener('click', exportHeightmapAsPNG);
    document.getElementById('exportRAW').addEventListener('click', exportHeightmapAsRAW);

    function generateHeightmapAndView() {
        const canvas = document.getElementById('heightmapCanvas');
        const ctx = canvas.getContext('2d');
        const resolution = parseInt(document.getElementById('resolutionSelect').value);
        canvas.width = resolution;
        canvas.height = resolution;
        console.log('Generate 3D view button clicked');
        const heightmap = createHeightmap(resolution, resolution);
        drawHeightmap(ctx, heightmap, resolution, resolution);
        render3DHeightmap(heightmap, resolution, resolution);
        console.log('3D view generation initiated');
    }

    // Error handling
    function logError(message) {
        const errorLog = document.getElementById('errorLog');
        const errorMessage = document.createElement('div');
        errorMessage.innerText = message;
        errorLog.appendChild(errorMessage);
        errorLog.scrollTop = errorLog.scrollHeight;
        console.error(message);
    }

    jsPlumbInstance.bind('connection', function(info) {
        const sourceId = info.sourceId;
        const targetId = info.targetId;
        if (info.sourceEndpoint.isTarget || info.targetEndpoint.isSource) {
            jsPlumbInstance.deleteConnection(info.connection);
            logError('Invalid connection: Connections can only be made from output to input.');
        } else {
            console.log(`Connection established: ${sourceId} -> ${targetId}`);
        }
    });

    jsPlumbInstance.bind('connectionDetached', function(info) {
        logError(`Connection detached: ${info.sourceId} to ${info.targetId}`);
    });

    jsPlumbInstance.bind('connectionMoved', function(info) {
        logError(`Connection moved: ${info.originalSourceId} to ${info.newSourceId}`);
    });

    // Permanent Input and Output Nodes
    const inputNode = document.createElement('div');
    inputNode.id = 'input';
    inputNode.classList.add('node');
    inputNode.style.top = '10px';
    inputNode.style.left = '10px';
    inputNode.innerHTML = '<div class="title">Input</div>';
    document.getElementById('editor').appendChild(inputNode);

    jsPlumbInstance.addEndpoint(inputNode, { 
        anchor: 'Right', 
        isSource: true, 
        isTarget: false, 
        endpoint: ['Dot', { radius: 7.5 }], 
        connector: ['Flowchart', { stub: 30, gap: 0 }], 
        paintStyle: { fill: 'black' } 
    });

    const outputNode = document.createElement('div');
    outputNode.id = 'output';
    outputNode.classList.add('node');
    outputNode.style.bottom = '10px';
    outputNode.style.right = '10px';
    outputNode.innerHTML = '<div class="title">Output</div>';
    document.getElementById('editor').appendChild(outputNode);

    jsPlumbInstance.addEndpoint(outputNode, { 
        anchor: 'Left', 
        isSource: false, 
        isTarget: true, 
        endpoint: ['Dot', { radius: 7.5 }], 
        connector: ['Flowchart', { stub: 30, gap: 0 }], 
        paintStyle: { fill: 'black' } 
    });

    // Fix Modal Blur Issue
    $('#nodeSettingsModal').on('hidden.bs.modal', function () {
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        document.body.style.overflow = 'auto'; // Ensuring the overflow is set to auto
        console.log('Node settings modal closed');
    });

    // Show Trash Bin on Drag
    jsPlumbInstance.bind('drag', function(info) {
        document.getElementById('trashBin').style.display = 'block';
        console.log('Drag started, trash bin displayed');
    });

    jsPlumbInstance.bind('dragStop', function(info) {
        checkNodePosition(info.el.id);
        document.getElementById('trashBin').style.display = 'none';
        console.log('Drag stopped, trash bin hidden');
    });

    // Resolution Select
    const resolutionSelect = document.createElement('select');
    resolutionSelect.id = 'resolutionSelect';
    resolutionSelect.classList.add('form-select', 'mt-3');
    [512, 1024, 2048, 4096, 8192].forEach(res => {
        const option = document.createElement('option');
        option.value = res;
        option.innerText = `${res}x${res}`;
        resolutionSelect.appendChild(option);
    });
    document.querySelector('#controls').insertBefore(resolutionSelect, document.getElementById('exportDropdown').parentElement);

    console.log('Resolution select added');
});
