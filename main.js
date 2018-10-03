/** @type {WebGLRenderingContext} */
var gl
var shaderProgram
var mvMatrix = mat4.create()
var mvMatrixStack = []
var pMatrix = mat4.create()

function initGL(canvas) {
    try {
        gl = canvas.getContext('webgl')
        gl.viewportWidth = canvas.width
        gl.viewportHeight = canvas.height
    } catch (e) {
        if (!gl) {
            alert('Tidak bisa inisialisasi WebGL')
        }
    }
}

function getShader(gl, id) {
    var shaderScript = document.getElementById(id)
    if (!shaderScript) {
        return null
    }
    var str = ''
    var k = shaderScript.firstChild
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent
        }
        k = k.nextSibling
    }
    var shader
    if (shaderScript.type == 'x-shader/x-fragment') {
        shader = gl.createShader(gl.FRAGMENT_SHADER)
    } else if (shaderScript.type = 'x-shader/x-vertex') {
        shader = gl.createShader(gl.VERTEX_SHADER)
    } else {
        return null
    }
    gl.shaderSource(shader, str)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader))
        return null
    }
    return shader
}

function initShaders() {
    var fragmentShader = getShader(gl, 'shader-fs')
    var vertexShader = getShader(gl, 'shader-vs')
    shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, fragmentShader)
    gl.attachShader(shaderProgram, vertexShader)
    gl.linkProgram(shaderProgram)
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Tidak bisa menginisialisasi shaders')
    }
    gl.useProgram(shaderProgram)
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute)
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor')
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute)
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix')
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix')
}

function mvPushMatrix() {
    var copy = mat4.create()
    mat4.copy(copy, mvMatrix)
    mvMatrixStack.push(copy)
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw 'Tumpukan matrix kosong'
    }
    mvMatrix = mvMatrixStack.pop()
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix)
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix)
}

function generate3D(vertices, faces) {
    var result = []
    for (var a=0;a<faces.length;a++) {
        for(var b=0;b<faces[a].length;b++){
            result = result.concat(vertices[faces[a][b]])
        }
    }
    return result
}

function generateColor(vertices, faces) {
    var result = []
    var color_map = []
    for (var a=0;a<vertices.length;a++) {
        color_map.push([Math.random(), Math.random(), Math.random(), 1.0])
    }
    for (var a=0;a<faces.length;a++) {
        for (var b=0;b<faces[a].length;b++) {
            result = result.concat(color_map[faces[a][b]])
        }
    }
    return result
}

function vertexPosition(vertexs, matrix) {
    var result = []
    vertexs.push(1.0)
    for (var a=0;a<4;a++) {
        result.push((vertexs[0]*matrix[a]) + (vertexs[1]*matrix[a+4]) + (vertexs[2]*matrix[a+8]) + (vertexs[3]*matrix[a+12]))
    }
    result.pop()
    return result
}

function checkCollision(kubus_matrix, huruf_matrix) {
    var realPos = []
    var kubusPos = []
    for (var a=0;a<hurufHboundaries.length;a++) {
        realPos.push(vertexPosition(hurufHboundaries[a], huruf_matrix))
    }
    for (var a=0;a<kubusboundaries.length;a++) {
        kubusPos.push(vertexPosition(kubusboundaries[a], kubus_matrix))
    }
    for (var a=0;a<realPos.length;a++) {
        if (realPos[a][0] >= kubusPos[0][0]) {
            if (hurufHarah[0] > 0) {
                hurufHarah[0] = hurufHarah[0] * -1.0
                hurufHrotation = hurufHrotation * -1.0
            }
        }
        if(realPos[a][0] <= kubusPos[1][0]) {
            if (hurufHarah[0] < 0){
                hurufHarah[0] = hurufHarah[0] * -1.0
                hurufHrotation = hurufHrotation * -1.0
            }
        }
        if (realPos[a][1] >= kubusPos[0][1]) {
            if (hurufHarah[1] > 0) {
                hurufHarah[1] = hurufHarah[1] * -1.0
                hurufHrotation = hurufHrotation * -1.0
            }
        }
        if(realPos[a][1] <= kubusPos[1][1]) {
            if (hurufHarah[1] < 0) {
                hurufHarah[1] = hurufHarah[1] * -1.0
                hurufHrotation = hurufHrotation * -1.0
            }
        }
        if (realPos[a][2] >= kubusPos[0][2]) {
            if (hurufHarah[2] > 0) {
                hurufHarah[2] = hurufHarah[2] * -1.0
                hurufHrotation = hurufHrotation * -1.0
            }
        }
        if(realPos[a][2] <= kubusPos[1][2]) {
            if (hurufHarah[2] < 0) {
                hurufHarah[2] = hurufHarah[2] * -1.0
                hurufHrotation = hurufHrotation * -1.0
            }
        }
    }
}

var hurufHobjek
var hurufHcolor
var hurufHboundaries
var hurufHsudut = 0
var hurufHrotation = 1.0*(Math.random() < 0.5 ? -1 : 1)
var hurufHtranslate = [0.0, 0.0, 0.0]
var hurufHarah = [0.1*(Math.random() < 0.5 ? -1 : 1), 0.1*(Math.random() < 0.5 ? -1 : 1), 0.1*(Math.random() < 0.5 ? -1 : 1)]

var kubusobjek
var kubuscolor
var kubusboundaries

var Hcolor = []
var Ccolor = []

function initBuffers() {
    // Huruf H
    //  5    3    0    3    5
    //6 A    B         C    D
    //
    //1      E         I    
    //0 
    //1      F         J    
    // 
    //6 G    H         K    L
    //
    // 12    13         14    15
    //00    01         02    03
    //
    //       16         20
    //      04         08
    //
    //       17         21
    //      05         09
    //
    // 18    19         22    23
    //06    07         10    11
    var Hvertex = [
        [-5.0, 6.0, 1.0],
        [-3.0, 6.0, 1.0],
        [3.0, 6.0, 1.0],
        [5.0, 6.0, 1.0],
        [-3.0, 1.0, 1.0],
        [-3.0, -1.0, 1.0],
        [-5.0, -6.0, 1.0],
        [-3.0, -6.0, 1.0],
        [3.0, 1.0, 1.0],
        [3.0, -1.0, 1.0],
        [3.0, -6.0, 1.0],
        [5.0, -6.0, 1.0],
        [-5.0, 6.0, -1.0],
        [-3.0, 6.0, -1.0],
        [3.0, 6.0, -1.0],
        [5.0, 6.0, -1.0],
        [-3.0, 1.0, -1.0],
        [-3.0, -1.0, -1.0],
        [-5.0, -6.0, -1.0],
        [-3.0, -6.0, -1.0],
        [3.0, 1.0, -1.0],
        [3.0, -1.0, -1.0],
        [3.0, -6.0, -1.0],
        [5.0, -6.0, -1.0],
    ]
    var Hfaces = [
        [0, 12, 1],
        [12, 13, 1],
        [2, 15, 3],
        [2, 14, 15],
        [4, 16, 8],
        [16, 20, 8],
        [17, 21, 9],
        [5, 17, 9],
        [6, 18, 19],
        [6, 7, 19],
        [22, 23, 11],
        [10, 22, 11],
        [0, 1, 7],
        [0, 6, 7],
        [2, 3, 11],
        [2, 10, 11],
        [12, 13, 19],
        [12, 18, 19],
        [14, 15, 23],
        [14, 22, 23],
        [4, 8, 9],
        [4, 5, 9],
        [16, 20, 21],
        [16, 17, 21],
        [0, 12, 18],
        [0, 6, 18],
        [1, 13, 16],
        [1, 4, 16],
        [5, 17, 19],
        [5, 7, 19],
        [2, 14, 20],
        [2, 8, 20],
        [9, 21, 22],
        [9, 10, 22],
        [3, 15, 23],
        [3, 11, 23]
    ]
    var Hvertices = generate3D(Hvertex, Hfaces)
    Hcolor = generateColor(Hvertex, Hfaces)
    hurufHobjek = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, hurufHobjek)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Hvertices), gl.STATIC_DRAW)
    hurufHobjek.itemSize = 3
    hurufHobjek.numItems = Hvertices.length / 3
    hurufHcolor = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, hurufHcolor)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Hcolor), gl.STATIC_DRAW)
    hurufHcolor.itemSize = 4
    hurufHcolor.numItems = hurufHobjek.numItems
    hurufHboundaries = [
        [-5.0, 6.0, 1.0],
        [-5.0, 6.0, -1.0],
        [-5.0, -6.0, 1.0],
        [-5.0, -6.0, -1.0],
        [5.0, 6.0, 1.0],
        [5.0, 6.0, -1.0],
        [5.0, -6.0, 1.0],
        [5.0, -6.0, -1.0]
    ]

    //Cubic
    // 4    6
    //0    2
    //
    // 5    7
    //1    3
    var Cvertex = [
        [-25.0, 25.0, 25.0],
        [-25.0, -25.0, 25.0],
        [25.0, 25.0, 25.0],
        [25.0, -25.0, 25.0],
        [-25.0, 25.0, -25.0],
        [-25.0, -25.0, -25.0],
        [25.0, 25.0, -25.0],
        [25.0, -25.0, -25.0],
    ]
    var Cfaces = [
        [0,2],
        [0,4],
        [4,6],
        [2,6],
        [4,5],
        [6,7],
        [0,1],
        [2,3],
        [1,5],
        [5,7],
        [3,7],
        [1,3]
    ]
    var Cvertices = generate3D(Cvertex, Cfaces)
    Ccolor = generateColor(Cvertex, Cfaces)
    kubusobjek = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, kubusobjek)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Cvertices), gl.STATIC_DRAW)
    kubusobjek.itemSize = 3
    kubusobjek.numItems = Cvertices.length / 3
    kubuscolor = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, kubuscolor)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Ccolor), gl.STATIC_DRAW)
    kubuscolor.itemSize = 4
    kubuscolor.numItems = kubusobjek.numItems
    kubusboundaries = [
        [25.0, 25.0, 25.0],
        [-25.0, -25.0, -25.0]
    ]
}

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    mat4.perspective(pMatrix, glMatrix.toRadian(45), gl.viewportWidth / gl.viewportHeight, 0.1, 200.0)
    mat4.identity(mvMatrix)
    mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, -100.0])
    mvPushMatrix()
    gl.bindBuffer(gl.ARRAY_BUFFER, kubusobjek)
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, kubusobjek.itemSize, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, kubuscolor)
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, kubuscolor.itemSize, gl.FLOAT, false, 0, 0)
    var kubus_matrix = mat4.create()
    mat4.copy(kubus_matrix, mvMatrix)
    setMatrixUniforms()
    gl.drawArrays(gl.LINES, 0, kubusobjek.numItems)
    mvPopMatrix()
    //Huruf H
    mvPushMatrix()
    mat4.translate(mvMatrix, mvMatrix, hurufHtranslate)
    mat4.rotate(mvMatrix, mvMatrix, glMatrix.toRadian(hurufHsudut), [0.0, 1.0, 0.0])
    gl.bindBuffer(gl.ARRAY_BUFFER, hurufHobjek)
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, hurufHobjek.itemSize, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, hurufHcolor)
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, hurufHcolor.itemSize, gl.FLOAT, false, 0, 0)
    var huruf_matrix = mat4.create()
    mat4.copy(huruf_matrix, mvMatrix)
    setMatrixUniforms()
    gl.drawArrays(gl.TRIANGLES, 0, hurufHobjek.numItems)
    mvPopMatrix()
    checkCollision(kubus_matrix, huruf_matrix)
}

var lastTime = 0
function animate() {
    var timeNow = new Date().getTime()
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime
        hurufHsudut += ((90 * elapsed) / 1000.0)*hurufHrotation
        hurufHtranslate[0] += hurufHarah[0]
        hurufHtranslate[1] += hurufHarah[1]
        hurufHtranslate[2] += hurufHarah[2]
    }
    lastTime = timeNow
}

function tick() {
    requestAnimationFrame(tick)
    drawScene()
    animate()
}

function webGLStart() {
    var canvas = document.getElementById('mycanvas')
    initGL(canvas)
    initShaders()
    initBuffers()
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)
    tick()
}