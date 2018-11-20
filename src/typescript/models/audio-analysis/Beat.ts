import { GetAnAudioAnalysisResponseTimeInterval } from '../../types/spotify-responses';
import TimeInterval from './TimeInterval';

class Beat extends TimeInterval {
  constructor(input: GetAnAudioAnalysisResponseTimeInterval) {
    super(input);
  }
}

export default Beat;
