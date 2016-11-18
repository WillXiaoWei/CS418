var teapotVertexBuffer;
var teapotTriIndexBuffer;

// ------------------------------------------------------
function setupTeapotBuffers(raw_file_text){
	var vertices = [];
	var faces = [];
	count_vertices = 0;
	count_faces = 0;
	
	var lines = raw_file_text.split("\n");
	for (var line_num in lines){
		list_elements = lines[line_num].split(' ');
		
		if (list_elements[0] == 'v'){
			vertices.push(parseFloat(list_elements[1]));
			vertices.push(parseFloat(list_elements[2]));
			vertices.push(parseFloat(list_elements[3]));
			count_vertices += 1;
		}
		else if(list_elements[0] == 'f'){
			faces.push(parseInt(list_elements[2])-1);
			faces.push(parseInt(list_elements[3])-1);
			faces.push(parseInt(list_elements[4])-1);
			count_faces += 1;
		}
	}
	
	console.log(vertices);
	console.log(faces);
	
	teapotVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	teapotVertexBuffer.numItems = count_vertices;
	
    teapotTriIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotTriIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces), gl.STATIC_DRAW);
	teapotTriIndexBuffer.numItems = count_faces;
}

function drawTeapot(){
	console.log(teapotVertexBuffer);
  // Draw the cube by binding the array buffer to the cube's vertices
  // array, setting attributes, and pushing it to GL.
  gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

  // Specify the texture to map onto the faces.
//  gl.activeTexture(gl.TEXTURE0);
//  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
//  gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

  // Draw the cube.
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotTriIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, 6768, gl.UNSIGNED_SHORT, 0);
}
