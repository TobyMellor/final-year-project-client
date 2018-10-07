export default `
  attribute vec4 aModelMatrix;
  attribute vec4 aVertexColor;

  uniform mat4 uCameraMatrix;
  uniform mat4 uProjectionMatrix;

  varying lowp vec4 vColor;

  void main() {
    gl_Position = uProjectionMatrix * uCameraMatrix * aModelMatrix;
    vColor = aVertexColor;
  }
`;
