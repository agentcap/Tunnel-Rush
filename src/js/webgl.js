
// Player Attributes.
var gravity = 0.0;
var speed = 0.0;
var speed_direction = 0.0;
var distance = 2.0;

// Objects in the Game
var tunnels = new Array();
var path = new Array();


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

    // tick_elements();

    drawScene(gl, programInfo, deltaTime);
    tick_inputs();
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function tick_elements() {
  extend_tunnel();
}

function extend_tunnel() {
  for(let i=0;i<tunnels.length;i++) {
    if(-tunnels[i].position[2] + tunnels[i].length > distance) {

    }
  }
}

function generate_tunnel(gl) {
  LIMIT = 25;
  LENGTH = 2;
  SIZE = 2;
  shift = 0.0;

  xpos = 0.0;
  zpos = 0.0;

  cord = []
  shift = []
  sft = 0.0;

  for(let i=0;i<LIMIT;i++) {
    // if (Math.floor(Math.random() * 100)%4 == 0) {
    //   sft = -0.5 + Math.floor(Math.random() * 10)/10;
    // }
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
  const eye = [r*Math.sin(gravity*Math.PI/180),-r*Math.cos(gravity*Math.PI/180),3-distance];
  const look = [r*Math.sin(gravity*Math.PI/180),-r*Math.cos(gravity*Math.PI/180),-1-distance];
  const up = [-Math.sin(gravity*Math.PI/180),Math.cos(gravity*Math.PI/180),0];
  mat4.lookAt(viewMatrix, eye, look, up);

  for(i=0;i<tunnels.length;i++) {
    tunnels[i].draw(gl, programInfo,projectionMatrix, viewMatrix);
  }
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

function tick_inputs() {
  if (pressedKeys[37]) gravity -= 5;
  if (pressedKeys[39]) gravity += 5;
  if (pressedKeys[38]) distance += 0.5;
  if (pressedKeys[40]) distance -= 0.5;
}

window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }
