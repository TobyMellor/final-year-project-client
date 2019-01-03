import * as React from 'react';
import CanvasService from '../services/canvas/CanvasService';
import WebAudioService from '../services/web-audio/WebAudioService';
import BranchService from '../services/branch/BranchService';

interface CircleCanvasProps {

}

class CircleCanvas extends React.Component<CircleCanvasProps> {
  constructor(props: CircleCanvasProps) {
    super(props);
  }

  componentDidMount() {
    const canvas: HTMLCanvasElement = this.getCanvas();

    // @ts-ignore window.CanvasService is for testing
    window.CanvasService = CanvasService.getInstance(canvas);

    // @ts-ignore window.WebAudioService is for testing
    window.WebAudioService = WebAudioService.getInstance();

    // @ts-ignore window.BranchService is for testing
    window.BranchService = BranchService.getInstance();
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
