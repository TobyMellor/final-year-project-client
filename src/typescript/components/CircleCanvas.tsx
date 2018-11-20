import * as React from 'react';
import CanvasService from '../services/canvas/CanvasService';
import MusicService from '../services/music/MusicService';

interface CircleCanvasProps {}

class CircleCanvas extends React.Component {
  constructor(props: CircleCanvasProps) {
    super(props);
  }

  componentDidMount() {
    const canvas: HTMLCanvasElement = this.getCanvas();

    CanvasService.getInstance(canvas);
    MusicService.getInstance();
  }

  render() {
    const canvasElement = (
      <canvas>
        Your browser does not support the HTML5 <code>&lt;canvas&gt;</code> element.
      </canvas>
    );

    return canvasElement;
  }

  private getCanvas(): HTMLCanvasElement {
    return document.querySelector('canvas');
  }
}

export default CircleCanvas;
