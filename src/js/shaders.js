function textureShader(gl) {

  // Vertex shader program
  const vsSource = `
    precision mediump float;
    
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying vec2 vTextureCoord;
    varying vec3 vLighting;
    varying vec3 vFragPos, vNormal;

    void main(void) {
      gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;

      vFragPos = vec3(uModelMatrix * aVertexPosition);
      vNormal  = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 1.0)));
    }
  `;

  // Fragment shader program
  const fsSource = `
    precision mediump float;
    
    struct Material {
      vec3 ambient;
      vec3 diffuse;
      vec3 specular;
      float shininess;
    };

    struct Light {
      vec3 position;

      vec3 ambient;
      vec3 diffuse;
      vec3 specular;
    };


    varying vec2 vTextureCoord;
    varying vec3 vLighting;
    varying vec3 vFragPos, vNormal;

    uniform sampler2D uSampler;
    const vec3 mAmbient = vec3(1.0,1.0,1.0);
    const vec3 mDiffuse =vec3(1.0,1.0,1.0);
    const vec3 mSpecular = vec3(1.0,1.0,1.0);
    const float mShininess = 20.0;

    // const vec3 lPosition = vec3(0,0,2);
    uniform vec3 lPosition;
    const vec3 lAmbient = vec3(0.01, 0.01, 0.01);
    // const vec3 lAmbient = vec3(0.3, 0.3, 0.3);
    const vec3 lDiffuse = vec3(1.0,1.0,1.0);
    const vec3 lSpecular = vec3(1.0,1.0,1.0);

    // const vec3 viewPos = vec3(0.0,0.0,2.0);
    uniform vec3 viewPos;

    void main(void) {
      // Ambient Light
      vec3 ambientLight = lAmbient * mAmbient;

      // Diffuse Light
      vec3 temp = lPosition-vFragPos;
      if(temp[2] > 100.0) temp[2] = 100.0;
      vec3 lightDir = (1.0-temp[2]/100.0)*normalize(lPosition - vFragPos);
      float diff = max(dot(vNormal, lightDir), 0.0);
      vec3 diffuseLight = 2.0*lDiffuse * (diff * mDiffuse);

      // Specular Light
      vec3 viewDir = normalize(viewPos - vFragPos);
      vec3 reflectDir = reflect(-lightDir, vNormal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), mShininess);
      vec3 specularLight = lSpecular * (spec * mSpecular);

      vec3 resultColor = ambientLight + diffuseLight + specularLight;

      vec4 texelColor = texture2D(uSampler, vTextureCoord);
      // gl_FragColor = vec4(texelColor.rgb * resultColor, texelColor.a);
      gl_FragColor = vec4(texelColor.rgb , texelColor.a);
    }
  `;

  function pow(a,b) {
    return Math.pow(a,b);
  }
  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
        viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
        normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
        viewPos: gl.getUniformLocation(shaderProgram, 'viewPos'),
        lPosition: gl.getUniformLocation(shaderProgram, 'lPosition'),
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
      },
  };

  return programInfo;
}


function colorShader(gl) {

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
  programInfo = {
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

  return programInfo;
}



//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}