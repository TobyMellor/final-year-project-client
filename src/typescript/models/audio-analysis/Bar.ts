import { GetAnAudioAnalysisResponseTimeInterval } from '../../types/spotify-responses';
import TimeInterval from './TimeInterval';

class Bar extends TimeInterval {
  constructor(input: GetAnAudioAnalysisResponseTimeInterval) {
    super(input);
  }
}

export default Bar;
