/**
* Function to handle user input (from arrow keys)
* @param {keystroke event} event Data structure containing information about the previous
*   keystroke.
*/
function handleKeyDown(event){
    // left arrow key -> spin left
    if (event.keyCode == 37){
        modelYRotationRadians -= 0.05;
		// TODO: Update viewDir
    }
    // right arrow key -> sping right
    else if (event.keyCode == 39){
        modelYRotationRadians += 0.05;
		// TODO: Update viewDir
    }
}

