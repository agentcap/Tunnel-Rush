function Tunnel(position, side, length, shift, gl) {
	this.position = position;
	this.length = length;
	this.side = side;
	this.shift = shift;

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

  	faceColors = [
	    [1.0,  1.0,  1.0,  1.0],    // Front face: white
	    [1.0,  0.0,  0.0,  1.0],    // Back face: red
	    [0.0,  1.0,  0.0,  1.0],    // Top face: green
	    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
	    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
	    [1.0,  0.0,  1.0,  1.0],    // Left face: purple
	    [1.0,  0.0,  0.0,  1.0],    // Back face: red
	    [0.0,  1.0,  0.0,  1.0],    // Top face: green
  	];

  	faceColors = shuffle(faceColors);

  	indices = [];

  	for(let i=0;i<8;i++) {
  		idx = [i*4, i*4+1, i*4+2, i*4+1, i*4+2, i*4+3];
  		indices = indices.concat(idx);
  	}

  	this.buffers = generate_buffers(gl,positions, faceColors, indices);
}

Tunnel.prototype.draw = function(gl, programInfo, projectionMatrix, viewMatrix) {
  	const modelViewMatrix = mat4.create();

	mat4.translate(modelViewMatrix,modelViewMatrix,this.position);
    mat4.multiply(modelViewMatrix,viewMatrix,modelViewMatrix);
	// mat4.rotate(modelViewMatrix,modelViewMatrix,this.rotation*Math.PI/180,[0, 0, 1]);

	setAttribute(gl,this.buffers,programInfo,projectionMatrix,modelViewMatrix);

	{
		const vertexCount = 48;
	    const type = gl.UNSIGNED_SHORT;
	    const offset = 0;
	    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  	}
}