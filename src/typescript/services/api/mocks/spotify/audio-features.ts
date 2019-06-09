/* tslint:disable max-line-length */

import { sample } from '../mocker';
import Translator from '../../../../../translations/Translator';

export function getAudioFeaturesMock(ID?: string) {
  const mocks = [
    // Drake Hotling Bling (0wwPcA6wtMf6HUMpIRdeP7)
    '{"danceability":0.903,"energy":0.621,"key":2,"loudness":-8.132,"mode":1,"speechiness":0.0578,"acousticness":0.00302,"instrumentalness":0.000186,"liveness":0.0504,"valence":0.553,"tempo":134.969,"type":"audio_features","id":"0wwPcA6wtMf6HUMpIRdeP7","uri":"spotify:track:0wwPcA6wtMf6HUMpIRdeP7","track_href":"https://api.spotify.com/v1/tracks/0wwPcA6wtMf6HUMpIRdeP7","analysis_url":"https://api.spotify.com/v1/audio-analysis/0wwPcA6wtMf6HUMpIRdeP7","duration_ms":267067,"time_signature":4}',

    // Taylor Swift End Game (2zMMdC4xvRClYcWNFJBZ0j)
    '{"danceability":0.649,"energy":0.589,"key":2,"loudness":-6.237,"mode":1,"speechiness":0.0558,"acousticness":0.00845,"instrumentalness":0,"liveness":0.108,"valence":0.151,"tempo":159.073,"type":"audio_features","id":"2zMMdC4xvRClYcWNFJBZ0j","uri":"spotify:track:2zMMdC4xvRClYcWNFJBZ0j","track_href":"https://api.spotify.com/v1/tracks/2zMMdC4xvRClYcWNFJBZ0j","analysis_url":"https://api.spotify.com/v1/audio-analysis/2zMMdC4xvRClYcWNFJBZ0j","duration_ms":244827,"time_signature":4}',
  ];

  if (ID) {
    const mockObjects = mocks.map(mock => JSON.parse(mock));
    const mockByID = mockObjects.find(mockObject => mockObject.id === ID) || null;

    if (!mockByID) throw new Error(Translator.errors.api.mock_not_found);

    return mockByID;
  }

  return sample(mocks);
}
