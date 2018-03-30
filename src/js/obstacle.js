function obstacle(position, size, length, rotation, gl) {
	this.position = position;
	this.size = size;
	this.rotation = rotation;
	this.length = length;

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

	const faceColors = [
	    [1.0,  1.0,  1.0,  1.0],
	    [0.0,  0.0,  0.0,  1.0],
	    [1.0,  1.0,  1.0,  1.0],
	    [0.0,  0.0,  0.0,  1.0],
	    [1.0,  1.0,  1.0,  1.0],
	    [0.0,  0.0,  0.0,  1.0],
	];

	const indices = [
	    0,  1,  2,      0,  2,  3,    // front
	    4,  5,  6,      4,  6,  7,    // back
	    8,  9,  10,     8,  10, 11,   // top
	    12, 13, 14,     12, 14, 15,   // bottom
	    16, 17, 18,     16, 18, 19,   // right
	    20, 21, 22,     20, 22, 23,   // left
	];

	this.buffers = generate_buffers(gl,positions, faceColors, indices);

}