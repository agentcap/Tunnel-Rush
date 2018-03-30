function Obstacle(position, size, length, rotation, speed, texture_type, gl) {
	this.position = position;
	this.size = size;
	this.rotation = rotation;
	this.length = length;
	this.speed = speed;
	this.texture_type = texture_type;

	var s = size/2;
	var l = length/2;
	const positions = [
	  // Front face
	  -s, -l,  s,
	   s, -l,  s,
	   s,  l,  s,
	  -s,  l,  s,
	  
	  // Back face
	  -s, -l, -s,
	  -s,  l, -s,
	   s,  l, -s,
	   s, -l, -s,
	  
	  // Top face
	  -s,  l, -s,
	  -s,  l,  s,
	   s,  l,  s,
	   s,  l, -s,
	  
	  // Bottom face
	  -s, -l, -s,
	   s, -l, -s,
	   s, -l,  s,
	  -s, -l,  s,
	  
	  // Right face
	   s, -l, -s,
	   s,  l, -s,
	   s,  l,  s,
	   s, -l,  s,
	  
	  // Left face
	  -s, -l, -s,
	  -s, -l,  s,
	  -s,  l,  s,
	  -s,  l, -s,
	];

	const indices = [
	    0,  1,  2,      0,  2,  3,    // front
	    4,  5,  6,      4,  6,  7,    // back
	    8,  9,  10,     8,  10, 11,   // top
	    12, 13, 14,     12, 14, 15,   // bottom
	    16, 17, 18,     16, 18, 19,   // right
	    20, 21, 22,     20, 22, 23,   // left
	];
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

	this.buffers = generate_buffers(gl,positions, [], indices, textureCoordinates);
}


Obstacle.prototype.draw = function(gl, programInfo, projectionMatrix, viewMatrix) {
  	const modelViewMatrix = mat4.create();

	mat4.translate(modelViewMatrix,modelViewMatrix,this.position);
	mat4.rotate(modelViewMatrix,modelViewMatrix,this.rotation*Math.PI/180,[0, 0, 1]);
    mat4.multiply(modelViewMatrix,viewMatrix,modelViewMatrix);

	setAttribute(gl,this.buffers,programInfo,projectionMatrix,modelViewMatrix, 'texture', this.texture_type);
	
	{
		const vertexCount = 36;
	    const type = gl.UNSIGNED_SHORT;
	    const offset = 0;
	    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  	}
}

Obstacle.prototype.detect_collision = function(pos, rotation, speed) {


    if (rotation >= 0) rotation = -Math.floor(rotation/360)*360 + rotation;
    else rotation = (Math.floor(Math.abs(rotation)/360)+1)*360 + rotation;

	var front_face = this.position[2] + this.size/2;
	var back_face = this.position[2] - this.size/2;

	var collide = (pos > front_face && front_face > pos - speed) ||
		(pos > back_face && back_face > pos - speed) || 
		(front_face > pos && pos > back_face);

	var comb = [];
	var tolr = 20;
	for(let i=0;i<5;i++) {
		comb.push([this.rotation+i*180-tolr,this.rotation+i*180+tolr]);
		comb.push([this.rotation-i*180-tolr,this.rotation-i*180+tolr]);
	}

	if(collide == true) {
		console.log(this.position, pos);
		for(let i=0;i<10;i++) {
			if(comb[i][0] < rotation && rotation < comb[i][1]) return true;
		}
	}

	return false;
}

Obstacle.prototype.tick = function() {
	this.rotation += this.speed;
}