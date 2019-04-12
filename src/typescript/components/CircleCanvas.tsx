import * as React from 'react';
import CanvasService from '../services/canvas/CanvasService';
import WebAudioService from '../services/web-audio/WebAudioService';
import BranchService from '../services/action/BranchService';
import TransitionService from '../services/action/TransitionService';
import ActionDecider from '../services/action/ActionDecider';
import { TransitionManager } from '../services/action/transition/transition-management';
import { BranchManager } from '../services/action/branch/branch-management';
import Dispatcher from '../events/Dispatcher';

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

    // @ts-ignore window.ActionDecider is for testing
    window.ActionDecider = ActionDecider.getInstance();

    // @ts-ignore window.BranchService is for testing
    window.BranchService = BranchService.getInstance();

    // @ts-ignore window.TransitionService is for testing
    window.TransitionService = TransitionService.getInstance();

    // @ts-ignore window.TransitionManager is for testing
    window.TransitionManager = TransitionManager;

    // @ts-ignore window.BranchManager is for testing
    window.BranchManager = BranchManager;

    // @ts-ignore window.Dispatcher is for testing
    window.Dispatcher = Dispatcher.getInstance();
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
