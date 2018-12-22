import { GetAnAudioAnalysisResponseTimeInterval } from '../../types/spotify-responses';
import TimeIntervalModel from './TimeInterval';

class BeatModel extends TimeIntervalModel {
  constructor(input: GetAnAudioAnalysisResponseTimeInterval) {
    super(input);
  }
}

export default BeatModel;
