function Tunnel(position, side, length, shift, gl) {
	this.position = position;
	this.length = length;

	const positions = [];

	var idx = 0;
	theta = -22.5;
	for(let i=0;i<8;i++) {
		positions[idx++] = side * Math.cos(theta*Math.PI/180);
		positions[idx++] = side * Math.sin(theta*Math.PI/180);
		positions[idx++] = 0;

		positions[idx++] = shift + side * Math.cos(theta*Math.PI/180);
		positions[idx++] = side * Math.sin(theta*Math.PI/180);
		positions[idx++] = -length;

		theta += 45;
		positions[idx++] = side * Math.cos(theta*Math.PI/180);
		positions[idx++] = side * Math.sin(theta*Math.PI/180);
		positions[idx++] = 0;

		positions[idx++] = shift + side * Math.cos(theta*Math.PI/180);
		positions[idx++] = side * Math.sin(theta*Math.PI/180);
		positions[idx++] = -length;
	}

  	const faceColors = [
	    [1.0,  1.0,  1.0,  1.0],    // Front face: white
	    [1.0,  0.0,  0.0,  1.0],    // Back face: red
	    [0.0,  1.0,  0.0,  1.0],    // Top face: green
	    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
	    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
	    [1.0,  0.0,  1.0,  1.0],    // Left face: purple
	    [1.0,  0.0,  0.0,  1.0],    // Back face: red
	    [0.0,  1.0,  0.0,  1.0],    // Top face: green
  	];

  	indices = [];

  	for(let i=0;i<8;i++) {
  		idx = [i*4, i*4+1, i*4+2, i*4+1, i*4+2, i*4+3];
  		indices = indices.concat(idx);
  	}

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


  	// Convert the array of colors into a table for all the vertices.
  	var colors = [];
  	for (let j = 0; j < faceColors.length; ++j) {
    	const c = faceColors[j];

    	// Repeat each color four times for the four vertices of the face
		colors = colors.concat(c, c, c, c);
	}
	const colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);


	const indexBuffer = gl.createBuffer();
  	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices), gl.STATIC_DRAW);

	this.buffers = {
	    position: positionBuffer,
    	color: colorBuffer,
    	indices: indexBuffer,
	};
}

Tunnel.prototype.draw = function(gl, programInfo, projectionMatrix, viewMatrix) {
  	const modelViewMatrix = mat4.create();

	mat4.translate(modelViewMatrix,
	                modelViewMatrix,
	                this.position);
	// mat4.rotate(modelViewMatrix,  // destination matrix
 //              modelViewMatrix,  // matrix to rotate
 //              this.rotation*Math.PI/180,     // amount to rotate in radians
 //              [0, 0, 1]);       // axis to rotate around (Z)

    mat4.multiply(modelViewMatrix,viewMatrix,modelViewMatrix);

	// mat4.rotate(modelViewMatrix,  // destination matrix
 //              modelViewMatrix,  // matrix to rotate
 //              45.0,// amount to rotate in radians
 //              [0, 1, 0]);       // axis to rotate around (X)


	setAttribute(gl,this.buffers,programInfo,projectionMatrix,modelViewMatrix);

	{
		const vertexCount = 48;
	    const type = gl.UNSIGNED_SHORT;
	    const offset = 0;
	    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  	}
}