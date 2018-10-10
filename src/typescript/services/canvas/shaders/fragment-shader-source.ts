export default `
  varying highp vec2 vTextureCoord;

  uniform sampler2D uSampler;

  void main() {
    gl_FragColor = texture2D(uSampler, vTextureCoord) * vec4(0.4, 0.4, 0.4, 1.0);
  }
`;
