import * as sinon from 'sinon';
import Dispatcher from '../../events/Dispatcher';
import * as fixture from '../../test/fixture';
import config from '../../config';
import WebAudioService from './WebAudioService';
import { FYPEvent } from '../../types/enums';

describe('Web Audio Service', () => {
  let dispatcher: Dispatcher;

  beforeEach(() => {
    config.fyp.shouldPlayMusic = false;

    dispatcher = Dispatcher.getInstance();
    getFreshWebAudioService();
  });

  it.skip('should toggle music through config.fyp.shouldPlayMusic', async () => {
    // @ts-ignore
    const queueBeatsForPlayingFn = WebAudioService.prototype.queueBeatsForPlaying = jest.fn();

    // Dispatch, expect to be called
    dispatcher.dispatch(FYPEvent.BeatBatchReady, {});
    expect(queueBeatsForPlayingFn).toBeCalledTimes(0);

    // Enable it to listen to the corresponding event
    config.fyp.shouldPlayMusic = true;

    getFreshWebAudioService();

    dispatcher.dispatch(FYPEvent.BeatBatchReady, {});
    expect(queueBeatsForPlayingFn).toBeCalledTimes(1);
  });

  function mockEventListener(event: FYPEvent): jest.Mock {
    const fn = jest.fn(() => {});

    dispatcher.on(event, fn);

    return fn;
  }

  function getFreshWebAudioService(): WebAudioService {
    // @ts-ignore Reinitialize the instance
    WebAudioService._instance = null;
    return WebAudioService.getInstance();
  }
});
