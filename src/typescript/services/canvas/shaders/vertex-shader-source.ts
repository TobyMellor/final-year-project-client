export default `
  attribute vec4 aModelMatrix;
  attribute vec4 aVertexColor;
  attribute vec2 aTextureCoord;

  uniform mat4 uCameraMatrix;
  uniform mat4 uProjectionMatrix;

  varying lowp vec4 vColor;
  varying highp vec2 vTextureCoord;

  void main() {
    gl_Position = uProjectionMatrix * uCameraMatrix * aModelMatrix;
    vColor = aVertexColor;
    vTextureCoord = aTextureCoord;
  }
`;
