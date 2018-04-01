
// Player Attributes.
var gravity_dir = 0.0;
var speed = 20;
var speed_direction = 0.0;
var ply_pos = [0,0,0];
var ply_height = -1;
var speed_v = 0;
var jump_speed = 0.07;
var gravity = 0.004;

// Objects in the Game

// Tunnel Characterstics
var tunnels = new Array();
var path = new Array();
var sft = 0.0;
var look_angle = 0.0;
var PATH_CNT = 30;
var path_cnt = PATH_CNT;
var path_flag = 0;

// Obstacles
var obstacles = new Array();
var doors = new Array();


// Keys
var key_left = false;
var key_right = false;
var pressedKeys = [];

// Textures
var texture = [];

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

  // Initialzing shaders
  programInfo_v = colorShader(gl);
  programInfo_t = textureShader(gl);

  // Initialize textures
  texture = {
    'brick': loadTexture(gl, 'static/images/brick.png'),
    'white': loadTexture(gl, 'static/images/white.jpg'),
    'cube': loadTexture(gl, 'static/images/cubetexture.png'),
    'fire': loadTexture(gl, 'static/images/brick.png'),
  };

  // Initialize tunnel
  generate_tunnel(gl);
  // obstacles.push( new Obstacle([0,-1,0],1,1,0,1,'cube', gl));
  size = 1;
  // obstacles.push( new Obstacle([0,0,0],
    // size,size,Math.floor(Math.random() * 360),1,'fire',gl));


  // Draw the scene repeatedly
  var then = 0;
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    tick_elements(gl);
    tick_inputs();
    detect_collisions(deltaTime);

    drawScene(gl, programInfo_v, programInfo_t, deltaTime);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function tick_elements(gl) {
  extend_tunnel(gl);
  tick_player();
  remove_obstacles();

  for(let i=0;i<obstacles.length;i++) {
    obstacles[i].tick();
  }
}

function detect_collisions(deltaTime) {
  for(let i=0;i<obstacles.length;i++) {
    if(obstacles[i].detect_collision(ply_pos[2],gravity_dir,speed*deltaTime)) {
      ply_pos[2] += 3;
      speed = 0;
    }
  }
  for(let i=0;i<doors.length;i++) {
    if(doors[i].detect_collision(ply_pos[2],gravity_dir,speed*deltaTime,ply_height)) {
      ply_pos[2] += 3;
      speed = 0;
    }
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
  ply_height += speed_v;
  speed_v -= gravity;

  if(ply_height < -1) {
    ply_height = -1;
    speed_v = 0;
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
        path_cnt = PATH_CNT;
      }
      else sft += 0.003*path_flag;
      if(Math.abs(sft) > 0.2) path_flag = -path_flag;

      type = 'brick';
      if(Math.floor(Math.random() * 4)%4 == 0) type = 'white';
      // Extending tunnel
      tunnels.push( new Tunnel([lastCord[0] + tunnels[tunnels.length-1].shift,lastCord[1],lastCord[2] - len], 
        size, len, sft, type, gl));

      // Generating Obstacles randomly
      if(Math.floor(Math.random() * 30)%30 == 0) {
        if(Math.floor(Math.random() * 2)%2 == 0) {
          doors.push( new Door([lastCord[0] + tunnels[tunnels.length-2].shift,lastCord[1],lastCord[2] - len]
            ,0.5,1.7,30,2,'fire',gl));
        }
        else {
        obstacles.push( new Obstacle([lastCord[0] + tunnels[tunnels.length-2].shift,lastCord[1],lastCord[2] - len],
            size/3,2*size,Math.floor(Math.random() * 360),2,'fire',gl));
        }
      }
    }
  }
}

function generate_tunnel(gl) {
  LIMIT = 100;
  LENGTH = 1;
  SIZE = 2;

  xpos = 0.0;
  zpos = 0.0;

  cord = []
  shift = []


  for(let i=0;i<LIMIT;i++) {
    path_cnt--;
    if(path_cnt <= 0 ) {
      path_flag = (-1 + Math.floor(Math.random() * 100)%3);
      path_cnt = PATH_CNT;
    }
    else {
      sft += 0.002*path_flag;
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
    tunnels.push( new Tunnel(cord[i], SIZE, LENGTH, shift[i], 'white', gl));
  }
}


//
// Draw the scene.
//
function drawScene(gl, programInfo_v, programInfo_t, deltaTime) {
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

  // Calculating Look Vector
  const r = 1;
  const eye = [ply_pos[0] - ply_height*Math.sin(gravity_dir*Math.PI/180),ply_pos[1] + ply_height*Math.cos(gravity_dir*Math.PI/180),ply_pos[2]];
  const look = [Math.sin(look_angle) + ply_pos[0] - ply_height*Math.sin(gravity_dir*Math.PI/180),ply_pos[1] + ply_height*Math.cos(gravity_dir*Math.PI/180),-Math.cos(look_angle)+ ply_pos[2]];
  const up = [-Math.sin(gravity_dir*Math.PI/180),Math.cos(gravity_dir*Math.PI/180),0];
  mat4.lookAt(viewMatrix, eye, look, up);

  for(let i=0;i<tunnels.length;i++) {
    tunnels[i].draw(gl, programInfo_t,projectionMatrix, viewMatrix, ply_pos);
  }

  for(let i=0;i<obstacles.length;i++) {
    obstacles[i].draw(gl, programInfo,projectionMatrix, viewMatrix, ply_pos);
  }

  for(let i=0;i<doors.length;i++) {
    doors[i].draw(gl, programInfo,projectionMatrix, viewMatrix, ply_pos);
  }


  // Moving the player forward
  ply_pos[2] -= deltaTime*speed;
}

function tick_inputs() {
  if (pressedKeys[37]) gravity_dir = (gravity_dir - 5 + 360)%360 ;
  if (pressedKeys[39]) gravity_dir = (gravity_dir + 5)%360;
  if (pressedKeys[38]) ply_pos[2] -= 0.25;
  if (pressedKeys[40]) ply_pos[2] += 0.25;
  if (pressedKeys[32]) {
    if(ply_height == -1) speed_v += jump_speed;
  }
}

window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }
