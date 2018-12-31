/* tslint:disable max-line-length */

import { sample } from '../mocker';

export function getAudioFeaturesMock(ID?: string) {
  const mocks = [
    // KIDS SEE GHOSTS
    //     - Reborn (4RVbK6cV0VqWdpCDcx3hiT)
    '{"danceability":0.585,"energy":0.597,"key":0,"loudness":-7.499,"mode":1,"speechiness":0.037,"acousticness":0.339,"instrumentalness":0.0404,"liveness":0.195,"valence":0.227,"tempo":100.051,"type":"audio_features","id":"4RVbK6cV0VqWdpCDcx3hiT","uri":"spotify:track:4RVbK6cV0VqWdpCDcx3hiT","track_href":"https://api.spotify.com/v1/tracks/4RVbK6cV0VqWdpCDcx3hiT","analysis_url":"https://api.spotify.com/v1/audio-analysis/4RVbK6cV0VqWdpCDcx3hiT","duration_ms":324674,"time_signature":4}',

    //     - Feel The Love (3aUFrxO1B8EW63QchEl3wX)
    '{"danceability":0.58,"energy":0.469,"key":0,"loudness":-5.946,"mode":0,"speechiness":0.104,"acousticness":0.126,"instrumentalness":0.0000732,"liveness":0.099,"valence":0.369,"tempo":110.573,"type":"audio_features","id":"3aUFrxO1B8EW63QchEl3wX","uri":"spotify:track:3aUFrxO1B8EW63QchEl3wX","track_href":"https://api.spotify.com/v1/tracks/3aUFrxO1B8EW63QchEl3wX","analysis_url":"https://api.spotify.com/v1/audio-analysis/3aUFrxO1B8EW63QchEl3wX","duration_ms":165053,"time_signature":4}',

    // Arctic Monkeys
    //     - My Propeller (2hmHlBM0kPBm17Y7nVIW9f)
    '{"danceability":0.415,"energy":0.657,"key":9,"loudness":-6.758,"mode":0,"speechiness":0.0295,"acousticness":0.052,"instrumentalness":0.0552,"liveness":0.233,"valence":0.69,"tempo":115.752,"type":"audio_features","id":"2hmHlBM0kPBm17Y7nVIW9f","uri":"spotify:track:2hmHlBM0kPBm17Y7nVIW9f","track_href":"https://api.spotify.com/v1/tracks/2hmHlBM0kPBm17Y7nVIW9f","analysis_url":"https://api.spotify.com/v1/audio-analysis/2hmHlBM0kPBm17Y7nVIW9f","duration_ms":205747,"time_signature":4}',

    //     - Crying Lightning (6wVWJl64yoTzU27EI8ep20)
    '{"danceability":0.498,"energy":0.885,"key":4,"loudness":-4.423,"mode":0,"speechiness":0.0461,"acousticness":0.0148,"instrumentalness":0.00041,"liveness":0.239,"valence":0.67,"tempo":106.719,"type":"audio_features","id":"6wVWJl64yoTzU27EI8ep20","uri":"spotify:track:6wVWJl64yoTzU27EI8ep20","track_href":"https://api.spotify.com/v1/tracks/6wVWJl64yoTzU27EI8ep20","analysis_url":"https://api.spotify.com/v1/audio-analysis/6wVWJl64yoTzU27EI8ep20","duration_ms":224827,"time_signature":4}',

    // Drake
    //     - Controlla (3O8NlPh2LByMU9lSRSHedm)
    '{"danceability":0.545,"energy":0.478,"key":10,"loudness":-11.066,"mode":0,"speechiness":0.287,"acousticness":0.0873,"instrumentalness":0,"liveness":0.114,"valence":0.317,"tempo":92.326,"type":"audio_features","id":"3O8NlPh2LByMU9lSRSHedm","uri":"spotify:track:3O8NlPh2LByMU9lSRSHedm","track_href":"https://api.spotify.com/v1/tracks/3O8NlPh2LByMU9lSRSHedm","analysis_url":"https://api.spotify.com/v1/audio-analysis/3O8NlPh2LByMU9lSRSHedm","duration_ms":245227,"time_signature":4}',

    //     - Hotling Bling (0wwPcA6wtMf6HUMpIRdeP7)
    '{"danceability":0.903,"energy":0.621,"key":2,"loudness":-8.132,"mode":1,"speechiness":0.0578,"acousticness":0.00302,"instrumentalness":0.000186,"liveness":0.0504,"valence":0.553,"tempo":134.969,"type":"audio_features","id":"0wwPcA6wtMf6HUMpIRdeP7","uri":"spotify:track:0wwPcA6wtMf6HUMpIRdeP7","track_href":"https://api.spotify.com/v1/tracks/0wwPcA6wtMf6HUMpIRdeP7","analysis_url":"https://api.spotify.com/v1/audio-analysis/0wwPcA6wtMf6HUMpIRdeP7","duration_ms":267067,"time_signature":4}',
  ];

  if (ID) {
    const mockObjects = mocks.map(mock => JSON.parse(mock));
    const mockByID = mockObjects.find(mockObject => mockObject.id === ID) || null;

    if (!mockByID) throw new Error('Could not find the desired Mock!');

    return mockByID;
  }

  return sample(mocks);
}
