function Door(position, size, shift, rotation, speed, texture_type, gl) {
	this.position = position;
	this.size = size;
	this.rotation = rotation;
	this.shift = shift;
	this.speed = speed;
	this.texture_type = texture_type;

	var s = size/2;
	var l = this.shift;

	positions = [];
	
	for(let i=0;i<4;i++) {
		x_shift=0;
		y_shift=0;
		if(i == 0) x_shift=shift,y_shift=0;
		else if(i == 1) x_shift=-shift,y_shift=0;
		else if(i == 2) x_shift=0,y_shift=shift;
		else if(i == 3) x_shift=0,y_shift=-shift;
		cube = [
			// Front face
		   	x_shift-s, y_shift-s,  s,
		   	x_shift+s, y_shift-s,  s,
		   	x_shift+s, y_shift+s,  s,
		   	x_shift-s, y_shift+s,  s,
		  
		  	// Back face
		  	x_shift-s, y_shift-s, -s,
		  	x_shift-s, y_shift+s, -s,
		  	x_shift+s, y_shift+s, -s,
		   	x_shift+s, y_shift-s, -s,
		  
		  	// Top face
		  	x_shift-s,  y_shift+s, -s,
		  	x_shift-s,  y_shift+s,  s,
		  	x_shift+s,  y_shift+s,  s,
		   	x_shift+s,  y_shift+s, -s,
		  
		  	// Bottom face
		  	x_shift-s, y_shift-s, -s,
		   	x_shift+s, y_shift-s, -s,
		   	x_shift+s, y_shift-s,  s,
		  	x_shift-s, y_shift-s,  s,
		  
		  	// Right face
		   	x_shift+s, y_shift-s, -s,
		   	x_shift+s, y_shift+s, -s,
		   	x_shift+s, y_shift+s,  s,
		   	x_shift+s, y_shift-s,  s,
		  
		  	// Left face
		  	x_shift-s, y_shift-s, -s,
		  	x_shift-s, y_shift-s,  s,
		  	x_shift-s, y_shift+s,  s,
		  	x_shift-s, y_shift+s, -s,
		];
		positions = positions.concat(cube);
	}

	indices = [];
	cube_index = [
	    0,  1,  2,      0,  2,  3,    // front
	    4,  5,  6,      4,  6,  7,    // back
	    8,  9,  10,     8,  10, 11,   // top
	    12, 13, 14,     12, 14, 15,   // bottom
	    16, 17, 18,     16, 18, 19,   // right
	    20, 21, 22,     20, 22, 23,   // left
	];

	for(let i=0;i<4;i++) {
		for(let j=0;j<cube_index.length;j++) {
			indices.push(24*i + cube_index[j]);
		}
	}

  	textureCoordinates = [
	    // Front
	    0.0,  0.0,
	    1.0,  0.0,
	    1.0,  1.0,
	    0.0,  1.0,
	    // Back
	    0.0,  0.0,
	    1.0,  0.0,
	    1.0,  1.0,
	    0.0,  1.0,
	    // Top
	    0.0,  0.0,
	    1.0,  0.0,
	    1.0,  1.0,
	    0.0,  1.0,
	    // Bottom
	    0.0,  0.0,
	    1.0,  0.0,
	    1.0,  1.0,
	    0.0,  1.0,
	    // Right
	    0.0,  0.0,
	    1.0,  0.0,
	    1.0,  1.0,
	    0.0,  1.0,
	    // Left
	    0.0,  0.0,
	    1.0,  0.0,
	    1.0,  1.0,
	    0.0,  1.0,
  	];

  	textureCoordinates = textureCoordinates.concat(textureCoordinates);
  	textureCoordinates = textureCoordinates.concat(textureCoordinates);

	vertexNormals = [
	    // Front
	     0.0,  0.0,  1.0,
	     0.0,  0.0,  1.0,
	     0.0,  0.0,  1.0,
	     0.0,  0.0,  1.0,

	    // Back
	     0.0,  0.0, -1.0,
	     0.0,  0.0, -1.0,
	     0.0,  0.0, -1.0,
	     0.0,  0.0, -1.0,

	    // Top
	     0.0,  1.0,  0.0,
	     0.0,  1.0,  0.0,
	     0.0,  1.0,  0.0,
	     0.0,  1.0,  0.0,

	    // Bottom
	     0.0, -1.0,  0.0,
	     0.0, -1.0,  0.0,
	     0.0, -1.0,  0.0,
	     0.0, -1.0,  0.0,

	    // Right
	     1.0,  0.0,  0.0,
	     1.0,  0.0,  0.0,
	     1.0,  0.0,  0.0,
	     1.0,  0.0,  0.0,

	    // Left
	    -1.0,  0.0,  0.0,
	    -1.0,  0.0,  0.0,
	    -1.0,  0.0,  0.0,
	    -1.0,  0.0,  0.0
	];
  	
  	vertexNormals = vertexNormals.concat(vertexNormals);
  	vertexNormals = vertexNormals.concat(vertexNormals);


	this.buffers = generate_buffers(gl,positions, [], indices, textureCoordinates, vertexNormals);
}


Door.prototype.draw = function(gl, programInfo, projectionMatrix, viewMatrix) {
	const modelMatrix = mat4.create();

  	viewPos = vec3.create();
  	viewPos[0] = ply_pos[0];
  	viewPos[1] = ply_pos[1];
  	viewPos[2] = ply_pos[2];
  	lPosition = viewPos;

	mat4.translate(modelMatrix,modelMatrix,this.position);
	mat4.rotate(modelMatrix,modelMatrix,this.rotation*Math.PI/180,[0, 0, 1]);

	setAttribute(gl,this.buffers,programInfo,projectionMatrix,modelMatrix,viewMatrix, 
		'texturenormal', this.texture_type, viewPos, lPosition);
	
	{
		const vertexCount = 36*4;
	    const type = gl.UNSIGNED_SHORT;
	    const offset = 0;
	    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  	}
}

Door.prototype.detect_collision = function(pos, rotation, speed, ply_height) {


    if (rotation >= 0) rotation = -Math.floor(rotation/360)*360 + rotation;
    else rotation = (Math.floor(Math.abs(rotation)/360)+1)*360 + rotation;

	var front_face = this.position[2] + this.size/2;
	var back_face = this.position[2] - this.size/2;

	var collide = (pos > front_face && front_face > pos - speed) ||
		(pos > back_face && back_face > pos - speed) || 
		(front_face > pos && pos > back_face);

	var comb = [];
	var tolr = 15;
	for(let i=0;i<10;i++) {
		comb.push([this.rotation+i*90-tolr,this.rotation+i*90+tolr]);
		comb.push([this.rotation-i*90-tolr,this.rotation-i*90+tolr]);
	}

	if(collide == true) {
		for(let i=0;i<10;i++) {
			if(comb[i][0] < rotation && rotation < comb[i][1]) {
				if(Math.abs(ply_height) > 0.7) return true;
				// return true;
			}
		}
	}

	return false;
}

Door.prototype.tick = function() {
	this.rotation = (this.rotation + this.speed)%360;
}
