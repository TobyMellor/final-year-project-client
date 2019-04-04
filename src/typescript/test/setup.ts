import * as sinon from 'sinon';
import * as THREE from 'three';

(<any> window).AudioContext = function () {
  return {
    currentTime: 0,
  };
};
(<any> window).HTMLCanvasElement.prototype.getContext = function () {
  return {
    fillRect: () => {},
    clearRect: () => {},
    getImageData: (x: number, y: number, w: number, h: number) => {},
    putImageData: () => {},
    createImageData: () => {},
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
  };
};

sinon.stub(THREE, 'WebGLRenderer').callsFake(
  jest.fn(() => {
    return {
      setPixelRatio: () => {},
      setClearColor: () => {},
      setSize: () => {},
      render: () => {},
    };
  }),
);
