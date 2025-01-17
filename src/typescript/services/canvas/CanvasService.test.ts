import CanvasService from './CanvasService';
import * as fixture from '../../test/fixture';
import Scene from './drawables/Scene';

describe('Canvas Service', () => {
  let addUpdatableFn: any;

  beforeEach(() => {
    CanvasService.getInstance();
    addUpdatableFn = Scene.prototype.add = jest.fn(() => Scene.prototype.add);
  });

  it.skip('renders bezier curves on PlayingTrackBranchesAnalyzed', async () => {
    const parentSongCircleCount = 1;
    const bezierCurveCount = 2;
    const playingNeedleCount = 1;
    const childSongCircleCount = 0;

    // nothing should be added to the scene yet
    expect(addUpdatableFn).toBeCalledTimes(0);

    // Simulate an analysis, triggering the songCircles to be rendered
    // There should be 1 song sircle, and 2 bezier curves on the scene
    fixture.dispatchTrackChanged();
    expect(addUpdatableFn).toBeCalledTimes(
      parentSongCircleCount + playingNeedleCount + childSongCircleCount,
    );

    // Dispatch a FYPEvent.PlayingTrackBranchAdded, render the 2 bezier curves
    fixture.dispatchPlayingTrackBranchAdded(bezierCurveCount);
    expect(addUpdatableFn).toBeCalledTimes(
      parentSongCircleCount + bezierCurveCount + playingNeedleCount + childSongCircleCount,
    );
  });
});
