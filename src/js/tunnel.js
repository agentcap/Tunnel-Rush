function Tunnel(position, side, length, shift, texture_type, gl) {
	this.position = position;
	this.length = length;
	this.side = side;
	this.shift = shift;
	this.texture_type = texture_type;

	positions = [];
	vertexNormals = [];

	var idx = 0;
	theta = -22.5;
	norm_t = 0;
	for(let i=0;i<8;i++) {
		positions[idx++] = side * Math.cos(theta*Math.PI/180);
		positions[idx++] = side * Math.sin(theta*Math.PI/180);
		positions[idx++] = 0;
		vertexNormals.concat([-Math.cos(norm_t*Math.PI/180), -Math.sin(norm_t*Math.PI/180), 0])

		positions[idx++] = shift + side * Math.cos(theta*Math.PI/180);
		positions[idx++] = side * Math.sin(theta*Math.PI/180);
		positions[idx++] = -length;

		A = vec3.create();
		A[0] = shift;
		A[1] = 0.0;
		A[2] = -length;
		
		B = vec3.create();
		B[0] = Math.cos(theta*Math.PI/180) - Math.cos((theta+45)*Math.PI/180);
		B[1] = Math.sin(theta*Math.PI/180) - Math.sin((theta+45)*Math.PI/180);
		B[2] = 0;

		C = vec3.create();
		vec3.cross(C,A,B);
		vertexNormals = vertexNormals.concat(C.toString().split(','));
		vertexNormals = vertexNormals.concat(C.toString().split(','));
		vertexNormals = vertexNormals.concat(C.toString().split(','));
		vertexNormals = vertexNormals.concat(C.toString().split(','));

		theta += 45;
		positions[idx++] = side * Math.cos(theta*Math.PI/180);
		positions[idx++] = side * Math.sin(theta*Math.PI/180);
		positions[idx++] = 0;

		positions[idx++] = shift + side * Math.cos(theta*Math.PI/180);
		positions[idx++] = side * Math.sin(theta*Math.PI/180);
		positions[idx++] = -length;
	}

	console.log(vertexNormals);

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

  	this.buffers = generate_buffers(gl,positions, [], indices, textureCoordinates, vertexNormals);
}

Tunnel.prototype.draw = function(gl, programInfo, projectionMatrix, viewMatrix) {
  	const modelMatrix = mat4.create();

	mat4.translate(modelMatrix,modelMatrix,this.position);

	setAttribute(gl,this.buffers,programInfo,projectionMatrix,modelMatrix,viewMatrix, 'texturenormal', this.texture_type);

	{
		const vertexCount = 48;
	    const type = gl.UNSIGNED_SHORT;
	    const offset = 0;
	    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  	}
}