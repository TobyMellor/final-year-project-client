export default `
  attribute vec4 aModelMatrix;
  attribute vec2 aTextureCoord;

  uniform mat4 uCameraMatrix;
  uniform mat4 uProjectionMatrix;

  varying highp vec2 vTextureCoord;

  void main() {
    gl_Position = uProjectionMatrix * uCameraMatrix * aModelMatrix;
    vTextureCoord = aTextureCoord;
  }
`;
