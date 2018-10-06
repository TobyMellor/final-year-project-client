import * as React from 'react';
import * as CanvasService from '../services/canvas/canvas-service';

interface CircleCanvasProps {}

export default class CircleCanvas extends React.Component {
  public state: {
    id: string, // e.g. canvas-4105
  };

  constructor(props: CircleCanvasProps) {
    super(props);
    this.state = {
      id: this.getRandomCanvasId(),
    };
  }

  componentDidMount() {
    const canvas: HTMLCanvasElement = document.querySelector(`#${this.state.id}`);
    CanvasService.startCanvasService(canvas);
  }

  render() {
    const canvasElement = (
      <canvas width="1200" height="600" id={this.state.id}>
        Your browser does not support the HTML5 <code>&lt;canvas&gt;</code> element.
      </canvas>
    );

    return canvasElement;
  }

  getRandomCanvasId() {
    const canvasId = Math.floor(1000 + Math.random() * 9000);

    return `canvas-${canvasId}`;
  }
}
