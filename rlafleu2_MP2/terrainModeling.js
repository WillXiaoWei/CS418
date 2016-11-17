/**
* @fileoverview This file is responsible for all of the terrain generation and manipulation
* calls. This file is dependent upon queue.js, gl-matrix-min.js, and webgl-utils.js.
*/

/**
* Function to initialize a flat, square terrain with (n+1) x (n+1) vertices
* @param {int} n Number of vertices to create in each direction
* @param {float} minX Lower bound of X values to position terrain
* @param {float} maxX Upper bound of X values to position terrain
* @param {float} minY Lower bound of Y values to position terrain
* @param {float} maxY Upper bound of Y values to position terrain
* @param {Array.<[float, float, float]>} vertexArray Array of floats
*   indicating the X,Y,Z coordinates of each vertex in space
* @param {Array.<[int, int, int]>} faceArray Array of integers specifing
*   which verticies constitute the triangle face
* @param {Array.<[float, float, float]>} normalArray Array of floats
*   indicating the X,Y,Z components of each face's normal vector
* @return {int} Number of triangles created
*/
function terrainFromIteration(n, minX,maxX,minY,maxY, vertexArray, faceArray, normalArray)
{
    // segment X and Y range into n parts
    var deltaX=(maxX-minX)/n;
    var deltaY=(maxY-minY)/n;
    
    // create all arrays by iterating over each vertex
    for(var i=0;i<=n;i++)
       for(var j=0;j<=n;j++)
       {
           vertexArray.push(minX+deltaX*j);
           vertexArray.push(minY+deltaY*i);
           vertexArray.push(0);
           
           normalArray.push(0);
           normalArray.push(0);
           normalArray.push(0);
       }

    var numT=0;
    // create triangles from left to right, row by row
    for(var i=0;i<n;i++)
       for(var j=0;j<n;j++)
       {
           var vid = i*(n+1) + j;
           faceArray.push(vid);
           faceArray.push(vid+1);
           faceArray.push(vid+n+1);
           
           faceArray.push(vid+1);
           faceArray.push(vid+1+n+1);
           faceArray.push(vid+n+1);
           numT+=2;
       }
    
    return numT;
}

/**
* This function applies the color map to the terrain. Depending on the height
*   vertices take on different colors
* @param {Array.<[float, float, float]} vTerrain Array of floats
*   indicating the X,Y,Z coordinates of each vertex in space
* @param {int} numV Number of vertices
* @param {Array.<[float, float, float, float]} cTerrain Array of RGB(alpha) values
*   to color the terrain. Initially is empty. After this function, is completely full.
* @return None
*/
function addColorToTerrain(vTerrain, numV, cTerrain){
    for (var i = 0; i < numV; i++){
        // color terrain white
        if (vTerrain[3*i + 2] >= 0.9*max){
            cTerrain.push(1.0);
            cTerrain.push(1.0);
            cTerrain.push(1.0);
            cTerrain.push(1.0);
        }
        // color terrain brown
        else if (vTerrain[3*i + 2] >= 0.5*max){
            cTerrain.push(0.25);
            cTerrain.push(0.25);
            cTerrain.push(0.2);
            cTerrain.push(1.0);
        }
        // color terrain green
        else{
            cTerrain.push(0.1328125);
            cTerrain.push(0.6);
            cTerrain.push(0.2);
            cTerrain.push(1.0);
        }
    }
}

/**
* This function performs the diamond-square algorithm for terrain generation.
*   It takes in a flat terrain and adds height to the terrain to give the
*   impression of mountains.
* @param {int} nw Index of the northwest corner of the terrain.
* @param {int} ne Index of the northeast corner of the terrain.
* @param {int} sw Index of the southwest corner of the terrain.
* @param {int} se Index of the southeast corner of the terrain.
* @param {Array.<[float, float, float]>} vTerrain Array of floats
*   indicating the X,Y,Z coordinates of each vertex in space
* @param {int} num_col Number of columns (and rows) in the terrain
* @return None
*/
function diamondSquare(nw, ne, sw, se, vTerrain, num_col){
    // instantiate queue
    var diamondQueue = new Queue();
    var size = 0.5*(ne-nw)*3
    // intial middle
    var mid = nw + size + size*num_col; 
    // starting point of scale for height
    var scale = 1;
    // factor to decrease scale by (to make for gradual descents/ascents)
    var scale_factor = 2;
    // variable to generate randomly whether the terrain should ascend or descend
    // on the next step
    var up_down;
    
    // queue initial middle point
    diamondQueue.enqueue(mid);
    diamondQueue.enqueue(size/2);
    diamondQueue.enqueue(scale*scale_factor);
    
    // calculate heights for original corners
    vTerrain[nw*3 + 2] = Math.random()/scale;
    if (vTerrain[nw*3 + 2] > max)
        max = vTerrain[nw*3+2];
    vTerrain[ne*3 + 2] = Math.random()/scale;
    if (vTerrain[ne*3 + 2] > max)
        max = vTerrain[ne*3+2];
    vTerrain[sw*3 + 2] = Math.random()/scale;
    if (vTerrain[sw*3 + 2] > max)
        max = vTerrain[sw*3+2];
    vTerrain[se*3 + 2] = Math.random()/scale;
    if (vTerrain[se*3 + 2] > max)
        max = vTerrain[se*3+2];
    
    // iterate over all vertices in the terrain to give height
    while (!diamondQueue.isEmpty()){
        // pop off last diag-point, new size of subsquare, new scale
        mid = diamondQueue.dequeue();
        size = diamondQueue.dequeue();
        scale = diamondQueue.dequeue();
                
        // calculate middle height //
        vTerrain[mid+2] = averageOfDiamondNeighbors(mid, 2*size, num_col, vTerrain) + Math.random()/scale;
        
        // calculate square midpoints
        // determine randomly to ascend or descend
        if (Math.random() > 0.5)
            up_down = 1;
        else
            up_down = -1;
        // generate new height
        vTerrain[mid - 2*size*num_col + 2] = averageOfSquareNeighbors(mid - 2*size*num_col, 3*nw, 3*ne, 3*sw, 3*se, 2*size, num_col, vTerrain) +            up_down*Math.random()/scale;
        // find max height value for use in color map
        if (vTerrain[mid - 2*size*num_col + 2] > max)
            max = vTerrain[mid - 2*size*num_col + 2];
        
        // determine randomly to ascend or descend
        if (Math.random() > 0.5)
            up_down = 1;
        else
            up_down = -1;
        // generate new height
        vTerrain[mid + 2*size*num_col + 2] = averageOfSquareNeighbors(mid + 2*size*num_col, 3*nw, 3*ne, 3*sw, 3*se, 2*size, num_col, vTerrain) +            up_down*Math.random()/scale;
        // find max height value for use in color map
        if (vTerrain[mid + 2*size*num_col + 2] > max)
            max = vTerrain[mid + 2*size*num_col + 2];
        
        // determine randomly to ascend or descend
        if (Math.random() > 0.5)
            up_down = 1;
        else
            up_down = -1;
        // generate new height
        vTerrain[mid - 2*size + 2] = averageOfSquareNeighbors(mid - 2*size, 3*nw, 3*ne, 3*sw, 3*se, 2*size, num_col, vTerrain) +                            up_down*Math.random()/scale;
        // find max height value for use in color map
        if (vTerrain[mid - 2*size + 2] > max)
            max = vTerrain[mid - 2*size + 2];
        
        // determine randomly to ascend or descend
        if (Math.random() > 0.5)
            up_down = 1;
        else
            up_down = -1;
        // generate new height
        vTerrain[mid + 2*size + 2] = averageOfSquareNeighbors(mid + 2*size, 3*nw, 3*ne, 3*sw, 3*se, 2*size, num_col, vTerrain) +                            up_down*Math.random()/scale;
        // find max height value for use in color map
        if (vTerrain[mid + 2*size + 2] > max)
            max = vTerrain[mid + 2*size + 2];
        
        // queue diags, new size values, and scale
        if (size >= 3){
            diamondQueue.enqueue(mid - size - size*num_col);
            diamondQueue.enqueue(size/2);
            diamondQueue.enqueue(scale*scale_factor);
            diamondQueue.enqueue(mid + size - size*num_col);
            diamondQueue.enqueue(size/2);
            diamondQueue.enqueue(scale*scale_factor);
            diamondQueue.enqueue(mid - size + size*num_col);
            diamondQueue.enqueue(size/2);
            diamondQueue.enqueue(scale*scale_factor);
            diamondQueue.enqueue(mid + size + size*num_col);
            diamondQueue.enqueue(size/2);
            diamondQueue.enqueue(scale*scale_factor);
        }
    }
}

/**
* This function determines the average height of a vertex's neighbors for the case of
*   an edge point of subsquare (i.e. vertical/horizontal move)
* @param {int} idx Index of vertex currently being given a new height
* @param {int} nw Index of terrain's northwest corner
* @param {int} ne Index of terrain's northeast corner
* @param {int} sw Index of terrain's southwest corner
* @param {int} se Index of terrain's southeast corner
* @param {int} size Size of current subsquare
* @param {int} num_col Number of columns in terrain
* @param {Array.<[float, float, float]>} vTerrain Array of floats
*   indicating the X,Y,Z coordinates of each vertex in space
* @return Average height of adjacent peaks
*/
function averageOfSquareNeighbors(idx, nw, ne, sw, se, size, num_col, vTerrain){
    // check boundary conditions //
    var count = 0;
    var checkNorth = true;
    var checkSouth = true;
    var checkEast = true;
    var checkWest = true;
        
    // check if examining point on north edge
    if (idx < ne) checkNorth = false;
    // check if examining point on south edge
    if ((sw <= idx) && (se >= idx)) checkSouth = false;
    // check if examining point on east edge
    if (idx % num_col == 0) checkEast = false;
    // check if examining point on west edge
    if (idx % (num_col-1) == 0) checkWest = false;
    
    // find average of neighbors (and only neighbors which exist)
    height_sum = 0;
    if (checkNorth){
        height_sum = height_sum + vTerrain[idx - size*num_col + 2];
        count = count + 1;
    }
    if (checkSouth){
        height_sum = height_sum + vTerrain[idx + size*num_col + 2];
        count = count + 1;
    }
    if (checkEast){
        height_sum = height_sum + vTerrain[idx + size + 2];
        count = count + 1;
    }
    if (checkWest){
        height_sum = height_sum + vTerrain[idx - size + 2];
        count = count + 1;
    }
    
    return height_sum/count;
}

/**
* This function determines the average height of a vertex's neighbors for the case of
*   a mid point (the diagonal move)
* @param {int} idx Index of vertex currently being given a new height
* @param {int} size Size of current subsquare
* @param {int} num_col Number of columns in terrain
* @param {Array.<[float, float, float]>} vTerrain Array of floats
*   indicating the X,Y,Z coordinates of each vertex in space
* @return Average height of adjacent peaks
*/
function averageOfDiamondNeighbors(idx, size, num_col, vTerrain){
    var height_sum = 0
        
    // add nw
    height_sum = height_sum + vTerrain[idx - size - size*num_col + 2];
    // add ne
    height_sum = height_sum + vTerrain[idx + size - size*num_col + 2];
    // add sw
    height_sum = height_sum + vTerrain[idx - size + size*num_col + 2];
    // add se
    height_sum = height_sum + vTerrain[idx + size + size*num_col + 2];
    
    return height_sum/4;
}

/**
* This function calculates the vertex normals by calculating the surface normals
*   of each face in the terrain, and then for each point averaging the surface normals
*   of the faces it is a part of.
* @param {Array.<[float, float, float]>} vTerrain Array of floats
*   indicating the X,Y,Z coordinates of each vertex in space
* @param {Array.<[int, int, int]>} Array of integers specifing
*   which verticies constitute the triangle face
* @param {int} numT Number of triangles in the terrain
* @param {int} numV Number of verticies in the terrain
* @param {Array.<[float, float, float]>} Array of floats
*   indicating the X,Y,Z components of each face's normal vector
* @return None
*/
function calculateNormals(vTerrain, fTerrain, numT, numV, tVertexNormalBuffer){
    var faceNormals = [];
    
    // calculate normals for each triangle
    for (var i = 0; i < numT; i++){
        var v1 = fTerrain[i*3];
        var v2 = fTerrain[i*3 + 1];
        var v3 = fTerrain[i*3 + 2];
        
        // compute surface normal
        var vector1 = vec3.fromValues(vTerrain[3*v2]-vTerrain[3*v1], vTerrain[3*v2+1]-vTerrain[3*v1+1], vTerrain[3*v2+2]-vTerrain[3*v1+2]);
        var vector2 = vec3.fromValues(vTerrain[3*v3]-vTerrain[3*v1], vTerrain[3*v3+1]-vTerrain[3*v1+1], vTerrain[3*v3+2]-vTerrain[3*v1+2]);
        var normal = vec3.create();
        vec3.cross(normal, vector1, vector2);
        
        faceNormals.push(normal[0]);
        faceNormals.push(normal[1]);
        faceNormals.push(normal[2]);
    }
    
    // initialize count array to all 0s
    var count = []
    for (var i = 0; i < numV; i++)
        count.push(0);
    
    // calculate sum of the surface normal vectors to which each vertex belongs
    for (var i = 0; i < numT; i++){
        var v1 = fTerrain[i*3 + 0]
        var v2 = fTerrain[i*3 + 1]
        var v3 = fTerrain[i*3 + 2]
        // iterate over each vertex in triangle
        count[v1] += 1
        count[v2] += 1
        count[v3] += 1
        
        // vertex 0
        tVertexNormalBuffer[3*v1 + 0] += faceNormals[i*3 + 0];
        tVertexNormalBuffer[3*v1 + 1] += faceNormals[i*3 + 1];
        tVertexNormalBuffer[3*v1 + 2] += faceNormals[i*3 + 2];
        
        // vertex 1
        tVertexNormalBuffer[3*v2+1 + 0] += faceNormals[i*3 + 0];
        tVertexNormalBuffer[3*v2+1 + 1] += faceNormals[i*3 + 1];
        tVertexNormalBuffer[3*v2+1 + 2] += faceNormals[i*3 + 2];
        
        // vertex 2
        tVertexNormalBuffer[3*v3+2 + 0] += faceNormals[i*3 + 0];
        tVertexNormalBuffer[3*v3+2 + 1] += faceNormals[i*3 + 1];
        tVertexNormalBuffer[3*v3+2 + 2] += faceNormals[i*3 + 2];
    }
    
    // average each normal vector in tVertexNormalBuffer
    // then normalize each normal vector in tVertexNormalBuffer
    for (var i = 0; i < numV; i++){
        // average out the adjacent surface normal vectors for point
        tVertexNormalBuffer[3*i+0] = tVertexNormalBuffer[3*i+0]/count[i];
        tVertexNormalBuffer[3*i+1] = tVertexNormalBuffer[3*i+1]/count[i];
        tVertexNormalBuffer[3*i+2] = tVertexNormalBuffer[3*i+2]/count[i];
        
        // normalize the normal vector
        var normal = vec3.fromValues(tVertexNormalBuffer[i*3+0], tVertexNormalBuffer[i*3+1], tVertexNormalBuffer[i*3+2]);
        var normalized = vec3.create();
        vec3.normalize(normalized, normal);
        
        // store the normal vector
        tVertexNormalBuffer[i*3+0] = normalized[0];
        tVertexNormalBuffer[i*3+1] = normalized[1];
        tVertexNormalBuffer[i*3+2] = normalized[2];
    }
    
}
