function Tunnel(position, side, length, shift, texture_type, gl) {
	this.position = position;
	this.length = length;
	this.side = side;
	this.shift = shift;
	this.texture_type = texture_type;

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


  	indices = [];
  	for(let i=0;i<8;i++) {
  		idx = [i*4, i*4+1, i*4+2, i*4+1, i*4+2, i*4+3];
  		indices = indices.concat(idx);
  	}

  	textureCoordinates = [];
  	textcnd = [
  		0.0, 0.0,
  		1.0, 0.0,
  		0.0, 1.0,
  		1.1, 1.1,
  	];
  	for(let i=0;i<8;i++) {
  		textureCoordinates = textureCoordinates.concat(textcnd);
  	}

  	this.buffers = generate_buffers(gl,positions, [], indices, textureCoordinates);
}

Tunnel.prototype.draw = function(gl, programInfo, projectionMatrix, viewMatrix) {
  	const modelViewMatrix = mat4.create();

	mat4.translate(modelViewMatrix,modelViewMatrix,this.position);
    mat4.multiply(modelViewMatrix,viewMatrix,modelViewMatrix);
	// mat4.rotate(modelViewMatrix,modelViewMatrix,this.rotation*Math.PI/180,[0, 0, 1]);

	setAttribute(gl,this.buffers,programInfo,projectionMatrix,modelViewMatrix, 'texture', this.texture_type);

	{
		const vertexCount = 48;
	    const type = gl.UNSIGNED_SHORT;
	    const offset = 0;
	    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  	}
}