export default `
  attribute vec4 aModelMatrix;

  uniform mat4 uCameraMatrix;
  uniform mat4 uProjectionMatrix;

  void main() {
    gl_Position = uProjectionMatrix * uCameraMatrix * aModelMatrix;
    /*gl_Position = aModelMatrix;*/
  }
`;
