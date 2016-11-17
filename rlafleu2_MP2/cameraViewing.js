/**
* @fileoverview This file is responsible for the manipulation of the camera view. It takes
* user input upon arrow key strokes and manipulates the view accordingly. This file is dependent
* upon gl-matrix-min.js and webgl-utils.js.
*/

/**
* Function which adds a new rotation around a given axis to the global quaternion 
* @param {float} rotationRate Angle (in radians) by which to rotate around the given axis
* @param {vec3.<float, float, float>} rotAxis Axis to rotate around
* @return None
*/
function quatRotation(rotationRate, rotAxis){
    // create a new quaternion to apply new rotation
    var tempQuat = quat.create();
    quat.setAxisAngle(tempQuat, rotAxis, rotationRate);
    quat.normalize(tempQuat, tempQuat);
    
    // apply new rotation to global quaternion
    quat.multiply(globalQuat, tempQuat, globalQuat);
    quat.normalize(globalQuat, globalQuat);
}

/**
* Function to handle user input (from arrow keys)
* @param {keystroke event} event Data structure containing information about the previous
*   keystroke.
*/
function handleKeyDown(event){
    // left arrow key -> roll left
    if (event.keyCode == 37){
        // rotate around viewDir
        quatRotation(-0.05, viewDir);
        
        // apply rotation to up vector
        vec3.transformQuat(up, origUp, globalQuat);
        vec3.normalize(up, up);
    }
    // right arrow key -> roll right
    else if (event.keyCode == 39){
        // rotate around viewDir
        quatRotation(0.05, viewDir);
        
        // apply rotation to up vector
        vec3.transformQuat(up, origUp, globalQuat);
        vec3.normalize(up, up);
    }
    // up arrow key -> pitch up
    else if (event.keyCode == 38){
        // rotate around cross product of up and viewDir vectors
        var result = vec3.create();
        vec3.cross(result, up, viewDir);
        vec3.normalize(result, result);
        
        // rotate around computed axis
        quatRotation(-0.01, result);
        
        // apply rotation to both the up and viewDir vectors
        vec3.transformQuat(up, origUp, globalQuat);
        vec3.normalize(up, up);
        vec3.transformQuat(viewDir, origViewDir, globalQuat);
        vec3.normalize(viewDir, viewDir);
    }
    // pitch down
    else if (event.keyCode == 40){       
        // rotate around cross product of up and viewDir vectors
        var result = vec3.create();
        vec3.cross(result, up, viewDir);
        vec3.normalize(result, result);
        
        // rotate around computed axis
        quatRotation(0.01, result);
        
        // apply rotation to both the up and viewDir vectors
        vec3.transformQuat(up, origUp, globalQuat);
        vec3.normalize(up, up);
        vec3.transformQuat(viewDir, origViewDir, globalQuat);
        vec3.normalize(viewDir, viewDir);
    }
}

