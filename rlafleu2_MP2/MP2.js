/**
* @fileoverview This file is the main javascript file for this program. It wraps together
* the terrain generation algorithms, the camera manipulation algorithms, and the lighting
* model. This file is where all the drawing functions are used. This file is dependent upon
* terrainModeling.js, cameraViewing.js, gl-matrix-min.js, and webgl-utils.js.
*/

var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer;

// Create a place to store terrain geometry
var tVertexPositionBuffer;

// Create a place to store colors for terrain
var tVertexColorBuffer;

// Create a place to store normals for shading
var tVertexNormalBuffer;

// Create a place to store the terrain triangles
var tIndexTriBuffer;

// Create a place to store the traingle edges
var tIndexEdgeBuffer;

// View parameters
var eyePt = vec3.fromValues(0.0,0.0,0.0);
var viewDir = vec3.fromValues(0.0,0.0,-1.0);
var origViewDir = vec3.fromValues(0.0,0.0,-1.0);
var up = vec3.fromValues(0.0,1.0,0.0);
var globalQuat = quat.create();

// Original view parameters
var origUp = vec3.fromValues(0.0, 1.0, 0.0);
var viewPt = vec3.fromValues(0.0,0.0,0.0);

// Variable to keep track of how far forward the flight simulator has moved
var transAmt = 0;

// Variable to keep track of max height of any vertex. Used for color map
var max = -10;

// Create the normal
var nMatrix = mat3.create();

// Create ModelView matrix
var mvMatrix = mat4.create();

//Create Projection matrix
var pMatrix = mat4.create();

var mvMatrixStack = [];


/**
* Function to generate flat terrain, then vary the heights of the terrain, then color the
*   terrain, then calculate the normals and faces of the terrain.
* return None
*/
function setupTerrainBuffers() {
    
    // Temporary storage arrays to be used in generating permanent buffers
    var vTerrain=[];
    var fTerrain=[];
    var nTerrain=[];
    var eTerrain=[];
    var cTerrain=[];
    var gridN=512;
    
    // Generate flat terrain
    var numT = terrainFromIteration(gridN, -1,1,-1,1, vTerrain, fTerrain, nTerrain);
    console.log("Generated ", numT, " triangles"); 
    
    // Perform the Diamond-Square algorithm to give height to the terrain
    tVertexPositionBuffer = gl.createBuffer();
    diamondSquare(0, gridN, gridN*(gridN+1), (gridN+1)*(gridN+1)-1, vTerrain, gridN+1)
    gl.bindBuffer(gl.ARRAY_BUFFER, tVertexPositionBuffer);      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vTerrain), gl.STATIC_DRAW);
    tVertexPositionBuffer.itemSize = 3;
    tVertexPositionBuffer.numItems = (gridN+1)*(gridN+1);
    
    // Add color to the terrain
    addColorToTerrain(vTerrain, tVertexPositionBuffer.numItems, cTerrain);
    tVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tVertexColorBuffer);      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cTerrain), gl.STATIC_DRAW);
    tVertexColorBuffer.itemSize = 4;
    tVertexColorBuffer.numItems = tVertexPositionBuffer.numItems;
    
    // Specify normals to be able to do lighting calculations
    tVertexNormalBuffer = gl.createBuffer();
    calculateNormals(vTerrain, fTerrain, numT, tVertexPositionBuffer.numItems, nTerrain)
    gl.bindBuffer(gl.ARRAY_BUFFER, tVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nTerrain),
                  gl.STATIC_DRAW);
    tVertexNormalBuffer.itemSize = 3;
    tVertexNormalBuffer.numItems = (gridN+1)*(gridN+1);
    
    // Specify faces of the terrain 
    tIndexTriBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndexTriBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(fTerrain),
                  gl.STATIC_DRAW);
    tIndexTriBuffer.itemSize = 1;
    tIndexTriBuffer.numItems = numT*3; 
}

/**
* Helper function to draw() routine to set the vertex positions, colors, normals before
*   drawing the terrain for each frame
* @return None
*/
function drawTerrain(){
    gl.polygonOffset(0,0);
    
    // Bind vertex locations
    gl.bindBuffer(gl.ARRAY_BUFFER, tVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, tVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Bind color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, tVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, tVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Bind normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, tVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           tVertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   

    //Draw 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndexTriBuffer);
    gl.drawElements(gl.TRIANGLES, tIndexTriBuffer.numItems, gl.UNSIGNED_INT,0);      
}

/**
* Function to pass the model view matrix to the shader program
* @return None
*/
function uploadModelViewMatrixToShader() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

/**
* Function to pass projectoin matrix to the shader program
* @return None
*/
function uploadProjectionMatrixToShader() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, 
                      false, pMatrix);
}

/**
* Function to pass the normal matrix to the shader program
* @return None
*/
function uploadNormalMatrixToShader() {
    mat3.fromMat4(nMatrix,mvMatrix);
    mat3.transpose(nMatrix,nMatrix);
    mat3.invert(nMatrix,nMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
}

/**
* Routine for pushing a current model view matrix to a stack for hieroarchial modeling
* @return None
*/
function mvPushMatrix() {
    var copy = mat4.clone(mvMatrix);
    mvMatrixStack.push(copy);
}

/**
* Routine for popping a stored model view matrix from stack for hieroarchial modeling
*/
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

/**
* Function which calls subroutines to upload model matricies to the shader program
* @return None
*/
function setMatrixUniforms() {
    uploadModelViewMatrixToShader();
    uploadNormalMatrixToShader();
    uploadProjectionMatrixToShader();
}

/**
* Subroutine which converts from degrees to radians
* @param {float} degrees Angle in degrees
* @return Value of angle in radians
*/
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/**
* Function to create a WebGL context upon startup
* @param {canvas} canvas Canvas object for the program
* @return WebGL context
*/
function createGLContext(canvas) {
    var names = ["webgl", "experimental-webgl"];
    var context = null;
    for (var i=0; i < names.length; i++) {
    try {
        context = canvas.getContext(names[i]);
    } catch(e) {}
        if (context) {
            break;
        }
    }
    if (context) {
        context.viewportWidth = canvas.width;
        context.viewportHeight = canvas.height;
    } else {
        alert("Failed to create WebGL context!");
    }
    return context;
}

/**
* Function to load shader from document
* @param {int} id ID to query for shader program from document
* @return Shader object for program
*/
function loadShaderFromDOM(id) {
    var shaderScript = document.getElementById(id);

    // If we don't find an element with the specified id
    // we do an early exit 
    if (!shaderScript) {
        return null;
    }

    // Loop through the children for the found DOM element and
    // build up the shader source code as a string
    var shaderSource = "";
    var currentChild = shaderScript.firstChild;
    while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
        shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    } 
    return shader;
}

/**
* Function to set up shader programs upon startup
* @return None
*/
function setupShaders() {
    // Load shaders from document
    vertexShader = loadShaderFromDOM("shader-vs");
    fragmentShader = loadShaderFromDOM("shader-fs");

    // Create shader program and attach both vertex and fragment shaders
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Failed to setup shaders");
    }

    gl.useProgram(shaderProgram);

    // Enable vertex positions
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    
    // Enable vertex colors
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    // Enable vertex normals
    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    // Set up uniforms (matricies and lighting vectors)
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.uniformLightPositionLoc = gl.getUniformLocation(shaderProgram, "uLightPosition");    
    shaderProgram.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram, "uAmbientLightColor");  
    shaderProgram.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram, "uDiffuseLightColor");
    shaderProgram.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram, "uSpecularLightColor");
}

/**
* Function to manipulate lighting information in shader for Phong Lighting Model
* @return None
*/
function uploadLightsToShader(loc,a,d,s) {
  gl.uniform3fv(shaderProgram.uniformLightPositionLoc, loc);
  gl.uniform3fv(shaderProgram.uniformAmbientLightColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseLightColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularLightColorLoc, s);
}

/**
* Function to setup the terrain buffers (see setupTerrainBuffers())
* @return None
*/
function setupBuffers() {
    setupTerrainBuffers();
}

/**
* Function to set camera location, viewing direction, up direction and model parameters
*   for each animation frame
* @return None
*/
function draw() { 
    // vectors for model manipulation
    var transformVec = vec3.create();
    var stepVec = vec3.create();
  
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // We'll use perspective 
    mat4.perspective(pMatrix,degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 200.0);

    // We want to look down -z, so create a lookat point in that direction    
    vec3.add(viewPt, eyePt, viewDir);
    // Then generate the lookat matrix and initialize the MV matrix to that view
    mat4.lookAt(mvMatrix,eyePt,viewPt,up);    
 
    // Draw Terrain
    mvPushMatrix();
    vec3.set(transformVec,0.0,-0.25,-3.0);
    
    // Create stepVec as a vector to move the flight simulator forward
    vec3.normalize(stepVec, viewDir);
    vec3.scale(stepVec, stepVec, -transAmt);
    transAmt += 0.001;
    
    // Set up model and move flight simulator forward by translating model in opposite
    //      direction of view direction
    mat4.translate(mvMatrix, mvMatrix, transformVec);
    mat4.translate(mvMatrix, mvMatrix, stepVec); // move forward
    mat4.rotateX(mvMatrix, mvMatrix, degToRad(-75));
    mat4.rotateZ(mvMatrix, mvMatrix, degToRad(25));     
    setMatrixUniforms();
    
    // Manipulate lighting informtion, draw the terrain and restore old model view matrix
    uploadLightsToShader([0,1,1],[0.0,0.0,0.3],[1.0,0.5,0.0],[1.0,1.0,0.0]);
    drawTerrain();
    mvPopMatrix();
}

/**
* Function for doing the initialization work of the program and kicking off
*   the animation callback
* @return None
*/
function startup() {
    canvas = document.getElementById("myGLCanvas");
    gl = createGLContext(canvas);
    setupShaders();
    setupBuffers();
    gl.clearColor(0.0, 0.4, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    var uints_for_indices = gl.getExtension("OES_element_index_uint");
    
    // set up event listener for keystrokes
    document.onkeydown = handleKeyDown;

    // kick off animation loop
    tick();
}


/**
* Callback function to perform draw each frame
* @return None
*/
function tick() {
    requestAnimFrame(tick);
    draw();
}
