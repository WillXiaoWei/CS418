
var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer;


// Create a place to store vertex colors
var vertexColorBuffer;

// Matrix for affine transformations
var mvMatrix = mat4.create();
// Transition steps
var Tx = 0.005, Ty = 0.001, Tz = 0.0;
// Variable for determining time steps in animate()
var lastTime = 0;
// X-offset from edge of canvas
var start = 0.7;
// offset of meshes from intial locations
var xPosition = 0.0, yPosition = 0.0;

// function: setMatrixUniforms
// inputs: none
// outputs: none
// Function to initialize mvMatrix
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

// function: createGLContext
// inputs: canvas - canvas instance used for rendering
// outputs: context - context of initialized canvas
// create WebGL context before drawing
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

// function: loadShaderFromDOM()
// input: id - element identifer to indicate script for     shader
// outputs: initialized shader
// description: load shader information
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

// function: setupShaders()
// inputs: none
// outputs: none
// description: set up vertex and fragment shaders by   loading from DOM
function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  
}

// function: setupBuffers()
// inputs: none
// outputs: none
// description: Initialize vertex buffer, as well as    initializing and putting in color values for graphic
function setupBuffers() {
    //initialize buffer to hold vertex positions
    vertexPositionBuffer = gl.createBuffer();
    
    vertexColorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
      var colors = [
          // Set up Blue Meshes with Illinois Blue
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
            0.0, 0.125, 0.35546875, 1.0,
          // Orange Meshes -- User Illinois Orange
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
            0.90625, 0.46484375, 0.1328125, 1.0,
    ];
    // fill buffer of float type, draw with STATIC_DRAW techniques, and set the size information
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.nufmItems = 108;  
}

// function: draw
// inputs: none
// outputs: none
// description: function that will be used to draw and      shade the pixel and fragments created with the other        functions
function draw() { 
// setup view point
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
// translate the graphic every time value
  mat4.translate(mvMatrix, mvMatrix, [Tx, Ty, Tz])
// draw verticies in vertexPositionBuffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
// shade verticies in vertexPositionBuffer with appropriate colors
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  setMatrixUniforms();
// actually draw the arrays
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
}

// value to help with non-affine transformation
var sinscalar = 0;
// variable to help bounce the orange meshes
var up = 1
// variable used to determine whether it is time to transform the orange meshes
var lastUpdate = 0;

// function: animate()
// inputs: none
// outputs: none
// description: function to determine values for the        vertices to be placed on the screen
function animate() {
    // get time values to determine if certain animations should be updated
    var timeNow = new Date().getTime();
    var elapsed = timeNow - lastTime;
    if (lastTime != 0) {
        // check if we have hit the x boundries and we should bounce the graphic in the opposite x direction
        if (xPosition > (1 - start) || xPosition < (-1+start))
            Tx = Tx * -1;
        // similar, check if we hit the y boundary and if we should bounce the graphic in the opposite y direction
        if (yPosition > (1 - start -0.2) || yPosition < (-1+start))
            Ty = Ty * -1;
        // keep track of where the graphic is on the screen
        xPosition = xPosition + Tx;
        yPosition = yPosition + Ty;
    }
    lastTime = timeNow;
    
    // only update non-affine transformation every 100 ms
    // this is to slow down the transformation rate
    if ((timeNow - lastUpdate) > 100){
        lastUpdate = timeNow;
        // update bounce value
        if (up > 0)
            sinscalar += 0.1;
        else
            sinscalar -= 0.1;
        // check boundary conditions to see if the bounce direction should change
        if ((up == 1) && (sinscalar < 0.5)){
            up = 1
        }
        else if ((up == 1) && (sinscalar >= 0.5)){
            up = 0
        }
        else if ((up == 0) && (sinscalar > 0.05)){
            up = 0;
        }
        else{
            up = 1
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    var triangleVertices = [
    // Draw the blue mesh the same every time (disregarding the affine transforamtions)    
      // Triangle 1
        -0.7,  0.9,  0.0,
        -0.7,  0.7,  0.0,
        -0.55,  0.7,  0.0,
      // Triangle 2
        -0.7,  0.9,  0.0,
        -0.55,  0.7,  0.0,
         0.7 ,  0.9,  0.0,
      // Triangle 3
        -0.55,  0.7,  0.0,
        -0.25,  0.7,  0.0,
         0.7 ,  0.9,  0.0,
      // Triangle 4
        -0.25,  0.7,  0.0,
         0.25,  0.7,  0.0,
         0.7 ,  0.9,  0.0,
      // Triangle 5
         0.25,  0.7,  0.0,
         0.55,  0.7,  0.0,
         0.7 ,  0.9,  0.0,
      // Triangle 6
         0.55,  0.7,  0.0,
         0.7 ,  0.7,  0.0,
         0.7 ,  0.9,  0.0,
      // Tri ngle 7
        -0.55,  0.7,  0.0,
        -0.55, -0.1,  0.0,
        -0.25, -0.1,  0.0,
      // Triangle 8
        -0.55,  0.7,  0.0,
        -0.25, -0.1,  0.0,
        -0.25,  0.1,  0.0,
      // Triangle 9
        -0.55,  0.7,  0.0,
        -0.25,  0.1,  0.0,
        -0.25,  0.5,  0.0,
      // Triangle 10
        -0.55,  0.7,  0.0,
        -0.25,  0.5,  0.0,
        -0.25,  0.7,  0.0,
      // Triangle 11
        -0.25,  0.1,  0.0,
        -0.25,  0.5,  0.0,
        -0.15,  0.1,  0.0,
      // Triangle 12
        -0.25,  0.5,  0.0,
        -0.15,  0.5,  0.0,
        -0.15,  0.1,  0.0,
      // Triangle 13
         0.55,  0.7,  0.0,
         0.25,  0.7,  0.0,
         0.25,  0.1,  0.0,
      // Triangle 14
         0.55,  0.7,  0.0,
         0.25,  0.5,  0.0,
         0.25,  0.1,  0.0,
      // Triangle 15
         0.55,  0.7,  0.0,
         0.25,  0.1,  0.0,
         0.25, -0.1,  0.0,
      // Triangle 16
         0.55,  0.7,  0.0,
         0.25, -0.1,  0.0,
         0.55, -0.1,  0.0,
      // Triangle 17
         0.15,  0.1,  0.0,
         0.15,  0.5,  0.0,
         0.25,  0.5,  0.0,
      // Triangle 18
         0.15,  0.1,  0.0,
         0.25,  0.1,  0.0,
         0.25,  0.5,  0.0,

    // Begin Orange Meshes
    // Bounce the orange meshes under a sine envelope for non-affine transformation
      // Triangle 19 -- left
        -0.55, -0.2 + Math.sin(0.2+sinscalar)*.05,  0.0,
        -0.55, -0.3,  0.0,
        -0.45, -0.2 + Math.sin(0.2+sinscalar)*.05,  0.0,
      // Triangle 20 -- right
        -0.55, -0.3,  0.0,
        -0.45, -0.2 + Math.sin(0.2+sinscalar)*.05,  0.0,
        -0.45, -0.3,  0.0,
      // Triangle 21 -- bottom
        -0.55, -0.3,  0.0,
        -0.45, -0.3,  0.0,
        -0.45, -0.375 - Math.sin(0.2+sinscalar)*.05,  0.0,

      // Triangle 22 -- left
        -0.35, -0.2 + Math.sin(0.1+sinscalar)*.15,  0.0,
        -0.35, -0.45,  0.0,
        -0.25, -0.2 + Math.sin(0.1+sinscalar)*.15 ,  0.0,
      // Triangle 23 -- right
        -0.35, -0.45,  0.0,
        -0.25, -0.45,  0.0,
        -0.25, -0.2 + Math.sin(0.1+sinscalar)*.15,  0.0,
      // Triangle 24 -- bottom
        -0.35, -0.45,  0.0,
        -0.25, -0.525 - Math.sin(0.1+sinscalar)*.05,  0.0,
        -0.25, -0.45,  0.0,

      // Triangle 25 -- left
        -0.15, -0.2 + Math.sin(sinscalar)*.5,  0.0,
        -0.15, -0.6,  0.0,
        -0.05, -0.2 + Math.sin(sinscalar)*.5,  0.0,
      // Triangle 26 -- right
        -0.05, -0.2 + Math.sin(sinscalar)*.5,  0.0,
        -0.15, -0.6,  0.0,
        -0.05, -0.6,  0.0,
      // Triangle 27 -- bottom
        -0.05, -0.6,  0.0,
        -0.15, -0.6,  0.0,
        -0.05, -0.675 - Math.sin(sinscalar)*.05,  0.0,

      // Triangle 28
        0.55, -0.2 + Math.sin(0.2+sinscalar)*.05,  0.0,
        0.55, -0.3,  0.0,
        0.45, -0.2 + Math.sin(0.2+sinscalar)*.05,  0.0,
      // Triangle 29
        0.55, -0.3,  0.0,
        0.45, -0.2 + Math.sin(0.2+sinscalar)*.05,  0.0,
        0.45, -0.3,  0.0,
      // Triangle 30
        0.55, -0.3,  0.0,
        0.45, -0.3,  0.0,
        0.45, -0.375 - Math.sin(0.2+sinscalar)*.05,  0.0,

      // Triangle 31
        0.35, -0.2 + Math.sin(0.1+sinscalar)*.15,  0.0,
        0.35, -0.45,  0.0,
        0.25, -0.2 + Math.sin(0.1+sinscalar)*.15,  0.0,
      // Triangle 32
        0.35, -0.45,  0.0,
        0.25, -0.45,  0.0,
        0.25, -0.2 + Math.sin(0.1+sinscalar)*.15,  0.0,
      // Triangle 33
        0.35, -0.45,  0.0,
        0.25, -0.525,  0.0 - Math.sin(0.1+sinscalar)*.05,
        0.25, -0.45,  0.0,

      // Triangle 34
        0.15, -0.2 + Math.sin(sinscalar)*.5,  0.0,
        0.15, -0.6,  0.0,
        0.05, -0.2 + Math.sin(sinscalar)*.5,  0.0,
      // Triangle 35
        0.05, -0.2 + Math.sin(sinscalar)*.5,  0.0,
        0.15, -0.6,  0.0,
        0.05, -0.6,  0.0,
      // Triangle 36
        0.05, -0.6,  0.0,
        0.15, -0.6,  0.0,
        0.05, -0.675 - Math.sin(sinscalar)*.05,  0.0,
  ];

// set vertex information, including the buffer and the     size data of the vertex buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = 108;
}

// function: startup
// inputs: none
// outputs: none
// description: function to set up canvas for drawing
function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
// set background to white
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
// start animation and drawing
  tick();
}

// function: tick()
// inputs: none
// outputs: none
// description: function to aid in the animation by         repeatedly calling the draw and animate functions every     time the screen updates
function tick() {
    requestAnimFrame(tick);
    draw();
    animate();
}
