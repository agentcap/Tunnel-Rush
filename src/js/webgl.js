
// Player Attributes.
var gravity = 0.0;
var speed = 10;
var speed_direction = 0.0;
var ply_pos = [0,0,0];

// Objects in the Game

// Tunnel Characterstics
var tunnels = new Array();
var path = new Array();
var sft = 0.0;
var look_angle = 0.0;
var path_cnt = 20;
var path_flag = 0;

// Obstacles
var obstacles = new Array();

// Keys
var key_left = false;
var key_right = false;
var pressedKeys = [];


main();

//
// Start here
//
function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  // const buffers = initBuffers(gl);
  // tunnel = new Tunnel([0,0,0],2,2,0,gl);
  generate_tunnel(gl);

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    tick_elements(gl);
    tick_inputs();
    detect_collisions(deltaTime);

    drawScene(gl, programInfo, deltaTime);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}


function detect_collisions(deltaTime) {
  for(let i=0;i<obstacles.length;i++) {
    if(obstacles[i].detect_collision(ply_pos[2],gravity,speed*deltaTime)) {
      ply_pos[2] += 3;
      speed = 0;
    }
  }
}

function tick_elements(gl) {
  extend_tunnel(gl);
  tick_player();
  remove_obstacles();

  for(let i=0;i<obstacles.length;i++) {
    obstacles[i].tick();
  }
}

function tick_player() {
  for(let i=0;i<tunnels.length;i++) {
    if(tunnels[i].position[2] > ply_pos[2] && ply_pos[2] > tunnels[i].position[2] - tunnels[i].length) {
      var diff = tunnels[i].position[2] - ply_pos[2];
      look_angle = Math.atan(tunnels[i].shift/tunnels[i].length);
      ply_pos[0] = tunnels[i].position[0] + ((diff)*tunnels[i].shift)/tunnels[i].length;
      ply_pos[1] = tunnels[i].position[1];

      break;
    }
  }
}

function remove_obstacles() {
  for(let i=0;i<obstacles.length;i++) {
    if(obstacles[i].position[2] - 4*obstacles[i].length > ply_pos[2]) {
      obstacles.shift();
    }
  }
}

function extend_tunnel(gl) {
  for(let i=0;i<tunnels.length;i++) {
    if(tunnels[i].position[2] - 4*tunnels[i].length > ply_pos[2]) {
      tunnels.shift();
      
      var lastCord = tunnels[tunnels.length-1].position;
      var len = tunnels[tunnels.length-1].length;
      var size = tunnels[tunnels.length-1].side;
      if(path_cnt <= 0 ) {
        path_flag = (-1 + Math.floor(Math.random() * 100)%3);
        path_cnt = 20;
      }
      else {
        sft += 0.001*path_flag;
      }
      if(Math.abs(sft) > 0.2) {
        path_flag = -path_flag;
      }
      tunnels.push( new Tunnel([lastCord[0] + tunnels[tunnels.length-1].shift,lastCord[1],lastCord[2] - len], 
        size, len, sft, gl));

      if(Math.floor(Math.random() * 60)%60 == 0) {
        console.log(obstacles.length);
        console.log(obstacles);
        obstacles.push( new Obstacle([lastCord[0] + tunnels[tunnels.length-1].shift,lastCord[1],lastCord[2] - len],
            size/3,2*size,Math.floor(Math.random() * 360),1,gl));
      }
    }
  }
}

function generate_tunnel(gl) {
  LIMIT = 100;
  LENGTH = 0.5;
  SIZE = 2;

  xpos = 0.0;
  zpos = 0.0;

  cord = []
  shift = []


  for(let i=0;i<LIMIT;i++) {
    path_cnt--;
    if(path_cnt <= 0 ) {
      path_flag = (-1 + Math.floor(Math.random() * 100)%3);
      path_cnt = 20;
    }
    else {
      sft += 0.001*path_flag;
    }
    if(Math.abs(sft) > 0.2) {
      path_flag = -path_flag;
    }

    cord.push([xpos,0,zpos]);
    shift.push(sft);
    xpos = xpos + sft;
    zpos = zpos - LENGTH;
  }

  for(let i=0;i<LIMIT;i++) {
    tunnels.push( new Tunnel(cord[i], SIZE, LENGTH, shift[i], gl));
  }
}


//
// Draw the scene.
//
function drawScene(gl, programInfo, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  const viewMatrix = mat4.create();

  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);
  const r = 1;
  const eye = [ply_pos[0] + r*Math.sin(gravity*Math.PI/180),ply_pos[1] + -r*Math.cos(gravity*Math.PI/180),ply_pos[2]];
  const look = [Math.sin(look_angle) + ply_pos[0] + r*Math.sin(gravity*Math.PI/180),ply_pos[1] + -r*Math.cos(gravity*Math.PI/180),-Math.cos(look_angle)+ ply_pos[2]];
  const up = [-Math.sin(gravity*Math.PI/180),Math.cos(gravity*Math.PI/180),0];
  mat4.lookAt(viewMatrix, eye, look, up);

  for(let i=0;i<tunnels.length;i++) {
    tunnels[i].draw(gl, programInfo,projectionMatrix, viewMatrix);
  }

  for(let i=0;i<obstacles.length;i++) {
    obstacles[i].draw(gl, programInfo,projectionMatrix, viewMatrix);
  }

  // Moving the player forward
  ply_pos[2] -= deltaTime*speed;
}

function setAttribute(gl, buffers, programInfo, projectionMatrix, modelViewMatrix) {
  // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
}

function generate_buffers(gl, positions, colors, indices) {
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

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
}

function tick_inputs() {
  if (pressedKeys[37]) gravity -= 5;
  if (pressedKeys[39]) gravity += 5;
  // if (pressedKeys[38]) ply_pos[2] -= 0.25;
  // if (pressedKeys[40]) ply_pos[2] += 0.25;
}

window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }
