export default `
  varying lowp vec4 vColor;
  varying highp vec2 vTextureCoord;

  uniform sampler2D uSampler;

  void main() {
    /*gl_FragColor = vColor;*/
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
`;
