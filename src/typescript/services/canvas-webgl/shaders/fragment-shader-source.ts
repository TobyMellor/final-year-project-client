export default `
  varying highp vec2 vTextureCoord;
  varying highp vec4 vTextureOverlay;

  uniform sampler2D uSampler;

  void main() {
    gl_FragColor = texture2D(uSampler, vTextureCoord) * vTextureOverlay;
  }
`;
