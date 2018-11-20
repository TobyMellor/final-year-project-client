export default `
  attribute vec4 aModelMatrix;
  attribute vec2 aTextureCoord;
  attribute vec4 aTextureOverlay;

  uniform mat4 uCameraMatrix;
  uniform mat4 uProjectionMatrix;

  varying highp vec2 vTextureCoord;
  varying highp vec4 vTextureOverlay;

  void main() {
    gl_Position = uProjectionMatrix * uCameraMatrix * aModelMatrix;
    vTextureCoord = aTextureCoord;
    vTextureOverlay = aTextureOverlay;
  }
`;
