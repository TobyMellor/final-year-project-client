import * as sinon from 'sinon';
import CanvasService from './CanvasService';
import Dispatcher from '../../events/Dispatcher';
import * as fixture from '../../test/fixture';
import Scene from './drawables/Scene';
import Updatable from './drawables/Updatable';

const THREE = require('three');

describe('Canvas Service', () => {
  let canvasService: CanvasService;
  let dispatcher: Dispatcher;
  let addUpdatableFn: any;

  beforeEach(() => {
    canvasService = CanvasService.getInstance();
    dispatcher = Dispatcher.getInstance();

    addUpdatableFn = Scene.prototype.add = jest.fn(() => Scene.prototype.add);
  });

  it('renders bezier curves on PlayingTrackBranchesAnalyzed', async () => {
    const parentSongCircleCount = 1;
    const bezierCurveCount = 2;
    const childSongCircleCount = 0;

    const playingTrackRenderedCallbackFn = fixture.listenPlayingTrackRendered();

    // FYPEvent.PlayingTrackRendered should not be dispatched before rendering and
    // nothing should be added to the scene yet
    expect(playingTrackRenderedCallbackFn).toBeCalledTimes(0);
    expect(addUpdatableFn).toBeCalledTimes(0);

    // Simulate an analysis, requiring 2 branches to be rendered
    await fixture.dispatchPlayingTrackBranchesAnalyzed(bezierCurveCount);

    // FYPEvent.PlayingTrackRendered should be dispatched after rendering
    // There should be 1 song sircle, and 2 bezier curves on the scene
    expect(playingTrackRenderedCallbackFn).toBeCalledTimes(1);
    expect(addUpdatableFn).toBeCalledTimes(
      parentSongCircleCount + bezierCurveCount + childSongCircleCount,
    );
  });
});
