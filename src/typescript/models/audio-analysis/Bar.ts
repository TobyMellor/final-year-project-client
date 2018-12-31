import { GetAnAudioAnalysisResponseTimeInterval } from '../../types/spotify-responses';
import TimeIntervalModel from './TimeInterval';

class BarModel extends TimeIntervalModel {
  constructor(input: GetAnAudioAnalysisResponseTimeInterval) {
    super(input);
  }
}

export default BarModel;
