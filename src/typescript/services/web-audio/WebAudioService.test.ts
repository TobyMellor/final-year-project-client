import * as sinon from 'sinon';
import Dispatcher from '../../events/Dispatcher';
import * as fixture from '../../test/fixture';
import config from '../../config';
import WebAudioService from './WebAudioService';
import { FYPEvent } from '../../types/enums';
import TrackModel from '../../models/audio-analysis/Track';
import { getATrackMock } from '../api/mocks/spotify/tracks';
import GetATrack from '../api/spotify/tracks';
import { createTrack } from '../../factories/track';

describe('Web Audio Service', () => {
  let dispatcher: Dispatcher;
  let webAudioService: WebAudioService;

  beforeEach(() => {
    config.fyp.shouldPlayMusic = false;

    dispatcher = Dispatcher.getInstance();
    webAudioService = getFreshWebAudioService();
  });

  it('should toggle music through config.fyp.shouldPlayMusic', async () => {
    // @ts-ignore
    const queueBeatsForPlayingFn = WebAudioService.prototype.queueBeatsForPlaying = jest.fn();

    // Dispatch, expect to be called
    dispatcher.dispatch(FYPEvent.BeatsReadyForQueueing, {});
    expect(queueBeatsForPlayingFn).toBeCalledTimes(0);

    // Enable it to listen to the corresponding event
    config.fyp.shouldPlayMusic = true;

    webAudioService = getFreshWebAudioService();

    dispatcher.dispatch(FYPEvent.BeatsReadyForQueueing, {});
    expect(queueBeatsForPlayingFn).toBeCalledTimes(1);
  });

  it('can manipulate child and playing tracks', async () => {
    const [track1, track2] = await Promise.all([
      createTrack('4RVbK6cV0VqWdpCDcx3hiT'),
      createTrack('3O8NlPh2LByMU9lSRSHedm'),
    ]);
    const playingTrackChangedListener = mockEventListener(FYPEvent.PlayingTrackChanged);

    // Adding the child tracks give the ability to search for them
    webAudioService.addChildTracks(track1, track2);
    expect(webAudioService.getTrack(track1.ID)).not.toBe(null);
    expect(webAudioService.getTrack(track2.ID)).not.toBe(null);
    expect(webAudioService.getTrack('a-track-not-present')).toBe(null);

    expect(playingTrackChangedListener).toBeCalledTimes(0);

    // Set a playing track
    await webAudioService.setPlayingTrack(track1);
    expect(webAudioService.getPlayingTrack().ID).toBe(track1.ID);
    expect(playingTrackChangedListener).toBeCalledTimes(1);

    // Ability to change playing track
    await webAudioService.setPlayingTrack(track2);
    expect(webAudioService.getPlayingTrack().ID).toBe(track2.ID);
    expect(playingTrackChangedListener).toBeCalledTimes(2);
  });

  function mockEventListener(event: FYPEvent): jest.Mock {
    const fn = jest.fn(() => {});

    dispatcher.on(event, {}, fn);

    return fn;
  }

  function getFreshWebAudioService(): WebAudioService {
    // @ts-ignore Reinitialize the instance
    WebAudioService._instance = null;
    return WebAudioService.getInstance();
  }
});
