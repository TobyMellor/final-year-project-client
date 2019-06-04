type SpotifyErrorResponse = {
  status: number;
  message: string;
};
interface BaseSpotifyServerSuccessResponse {
  config: object;
  data: object;
  headers: object;
  request: object;
  status: number;
  statusText: string;
}

type Image = {
  height: number;
  url: string;
  width: number;
};

type ExternalIdentifiers = {
  spotify: string;
};

type Copyright = {
  text: string;
  type: string;
};

type Paginatable = {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
};

type SimplifiedObjectModel = {
  external_urls: ExternalIdentifiers;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
};

interface SimplifiedTrack extends SimplifiedObjectModel {
  artists: SimplifiedObjectModel[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  preview_url: string;
  track_number: number;
}

interface SimplifiedTracksPaginated extends Paginatable {
  items: SimplifiedTrack[];
}

interface SimplifiedArtist extends SimplifiedObjectModel {}

interface SimplifiedAlbum extends SimplifiedObjectModel {
  album_type: string;
  artists: SimplifiedObjectModel[];
  available_markets: string[];
  external_ids: ExternalIdentifiers;
  images: Image[];
  release_date: string;
  release_date_precision: string;
}

export interface GetAnAudioAnalysisResponseTimeInterval {
  start: number;
  duration: number;
  confidence: number;
}

export type GetAnAudioAnalysisResponseSection = {
  start: number,
  duration: number,
  confidence: number,
  tempo: number,
  tempo_confidence: number,
  key: number,
  key_confidence: number,
  mode: number,
  mode_confidence: number,
  time_signature: number,
  time_signature_confidence: number,
};

export interface GetAnAudioAnalysisResponseSegment extends GetAnAudioAnalysisResponseTimeInterval {
  loudness_start?: number;
  loudness_max_time: number;
  loudness_max: number;
  loudness_end?: number;
  pitches: number[];
  timbre: number[];
}

/**
 * |-------------------------------------------------------------------|
 * |                                                                   |
 * |   Type's representing responses from the Spotify Web API          |
 * |   https://developer.spotify.com/documentation/web-api/reference   |
 * |                                                                   |
 * |-------------------------------------------------------------------|
 */

/**
 * GET https://api.spotify.com/v1/artists/{id}
 *
 * EXAMPLE:
 *  {
 *      "external_urls" : {
 *          "spotify" : "https://open.spotify.com/artist/0OdUWJ0sBjDrqHygGUXeCF"
 *      },
 *      "followers" : {
 *          "href" : null,
 *          "total" : 306565
 *      },
 *      "genres" : [ "indie folk", "indie pop" ],
 *      "href" : "https://api.spotify.com/v1/artists/0OdUWJ0sBjDrqHygGUXeCF",
 *      "id" : "0OdUWJ0sBjDrqHygGUXeCF",
 *      "images" : [ {
 *          "height" : 816,
 *          "url" : "https://i.scdn.co/image/eb266625dab075341e8c4378a177a27370f91903",
 *          "width" : 1000
 *      }, {
 *          "height" : 522,
 *          "url" : "https://i.scdn.co/image/2f91c3cace3c5a6a48f3d0e2fd21364d4911b332",
 *          "width" : 640
 *      } ],
 *      "name" : "Band of Horses",
 *      "popularity" : 59,
 *      "type" : "artist",
 *      "uri" : "spotify:artist:0OdUWJ0sBjDrqHygGUXeCF"
 *  }
 */

export interface GetAnArtistResponse extends SimplifiedArtist {
  followers: {
    href: string;
    total: number;
  };
  genres: string[];
  images: Image[];
  popularity: number;
}

/**
 * GET https://api.spotify.com/v1/album/{id}
 *
 * EXAMPLE:
 *  {
 *      "album_type" : "album",
 *      "artists" : [ {
 *          "external_urls" : {
 *              "spotify" : "https://open.spotify.com/artist/2BTZIqw0ntH9MvilQ3ewNY"
 *          },
 *          "href" : "https://api.spotify.com/v1/artists/2BTZIqw0ntH9MvilQ3ewNY",
 *          "id" : "2BTZIqw0ntH9MvilQ3ewNY",
 *          "name" : "Cyndi Lauper",
 *          "type" : "artist",
 *          "uri" : "spotify:artist:2BTZIqw0ntH9MvilQ3ewNY"
 *      } ],
 *      "available_markets" : [ "AD", ..., "UY" ],
 *      "copyrights" : [ {
 *          "text" : "(P) 2000 Sony Music Entertainment Inc.",
 *          "type" : "P"
 *      } ],
 *      "external_ids" : {
 *          "upc" : "5099749994324"
 *      },
 *      "external_urls" : {
 *          "spotify" : "https://open.spotify.com/album/0sNOF9WDwhWunNAHPD3Baj"
 *      },
 *      "genres" : [ ],
 *      "href" : "https://api.spotify.com/v1/albums/0sNOF9WDwhWunNAHPD3Baj",
 *      "id" : "0sNOF9WDwhWunNAHPD3Baj",
 *      "images" : [ {
 *          "height" : 640,
 *          "url" : "https://i.scdn.co/image/07c323340e03e25a8e5dd5b9a8ec72b69c50089d",
 *          "width" : 640
 *      } ],
 *      "name" : "She's So Unusual",
 *      "popularity" : 39,
 *      "release_date" : "1983",
 *      "release_date_precision" : "year",
 *      "tracks" : {
 *          "href" : "[REMOVED]",
 *          "items" : [ {
 *              "artists" : [ {
 *                  "external_urls" : {
 *                      "spotify" : "https://open.spotify.com/artist/2BTZIqw0ntH9MvilQ3ewNY"
 *                  },
 *                  "href" : "https://api.spotify.com/v1/artists/2BTZIqw0ntH9MvilQ3ewNY",
 *                  "id" : "2BTZIqw0ntH9MvilQ3ewNY",
 *                  "name" : "Cyndi Lauper",
 *                  "type" : "artist",
 *                  "uri" : "spotify:artist:2BTZIqw0ntH9MvilQ3ewNY"
 *              } ],
 *              "available_markets" : [ "AD", ..., "UY" ],
 *              "disc_number" : 1,
 *              "duration_ms" : 305560,
 *              "explicit" : false,
 *              "external_urls" : {
 *                  "spotify" : "https://open.spotify.com/track/3f9zqUnrnIq0LANhmnaF0V"
 *              },
 *              "href" : "https://api.spotify.com/v1/tracks/3f9zqUnrnIq0LANhmnaF0V",
 *              "id" : "3f9zqUnrnIq0LANhmnaF0V",
 *              "name" : "Money Changes Everything",
 *              "preview_url" : "[REMOVED]",
 *              "track_number" : 1,
 *              "type" : "track",
 *              "uri" : "spotify:track:3f9zqUnrnIq0LANhmnaF0V"
 *          }, {
 *          ...
 *          } ],
 *        "limit" : 50,
 *        "next" : null,
 *        "offset" : 0,
 *        "previous" : null,
 *        "total" : 13
 *      },
 *      "type" : "album",
 *      "uri" : "spotify:album:0sNOF9WDwhWunNAHPD3Baj"
 *  }
 */

export interface GetAnAlbumResponse extends SimplifiedAlbum {
  copyrights: Copyright[];
  genres: string[];
  popularity: number;
  tracks: SimplifiedTracksPaginated[];
}

/**
 * GET https://api.spotify.com/v1/tracks/{id}
 *
 * EXAMPLE:
 *  {
 *      "album": {
 *          "album_type": "single",
 *          "artists": [
 *              {
 *                  "external_urls": {
 *                    "spotify": "https://open.spotify.com/artist/6sFIWsNpZYqfjUpaCgueju"
 *                  },
 *                  "href": "https://api.spotify.com/v1/artists/6sFIWsNpZYqfjUpaCgueju",
 *                  "id": "6sFIWsNpZYqfjUpaCgueju",
 *                  "name": "Carly Rae Jepsen",
 *                  "type": "artist",
 *                  "uri": "spotify:artist:6sFIWsNpZYqfjUpaCgueju"
 *               }
 *          ],
 *          "available_markets": [
 *              "AD",
 *              ...,
 *              "ZA"
 *          ],
 *          "external_urls": {
 *              "spotify": "https://open.spotify.com/album/0tGPJ0bkWOUmH7MEOR77qc"
 *          },
 *          "href": "https://api.spotify.com/v1/albums/0tGPJ0bkWOUmH7MEOR77qc",
 *          "id": "0tGPJ0bkWOUmH7MEOR77qc",
 *          "images": [
 *              {
 *                  "height": 640,
 *                  "url": "https://i.scdn.co/image/966ade7a8c43b72faa53822b74a899c675aaafee",
 *                  "width": 640
 *              }
 *          ],
 *          "name": "Cut To The Feeling",
 *          "release_date": "2017-05-26",
 *          "release_date_precision": "day",
 *          "type": "album",
 *          "uri": "spotify:album:0tGPJ0bkWOUmH7MEOR77qc"
 *      },
 *      "artists": [
 *          {
 *              "external_urls": {
 *                  "spotify": "https://open.spotify.com/artist/6sFIWsNpZYqfjUpaCgueju"
 *              },
 *              "href": "https://api.spotify.com/v1/artists/6sFIWsNpZYqfjUpaCgueju",
 *              "id": "6sFIWsNpZYqfjUpaCgueju",
 *              "name": "Carly Rae Jepsen",
 *              "type": "artist",
 *              "uri": "spotify:artist:6sFIWsNpZYqfjUpaCgueju"
 *          }
 *      ],
 *      "available_markets": [
 *          "AD",
 *          ...,
 *          "ZA"
 *      ],
 *      "disc_number": 1,
 *      "duration_ms": 207959,
 *      "explicit": false,
 *      "external_ids": {
 *          "isrc": "USUM71703861"
 *      },
 *      "external_urls": {
 *          "spotify": "https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl"
 *      },
 *      "href": "https://api.spotify.com/v1/tracks/11dFghVXANMlKmJXsNCbNl",
 *      "id": "11dFghVXANMlKmJXsNCbNl",
 *      "is_local": false,
 *      "name": "Cut To The Feeling",
 *      "popularity": 63,
 *      "preview_url": "[REMOVED]",
 *      "track_number": 1,
 *      "type": "track",
 *      "uri": "spotify:track:11dFghVXANMlKmJXsNCbNl"
 *  }
 */

export interface GetATrackResponse extends SimplifiedTrack {
  album: SimplifiedAlbum;
  external_ids: ExternalIdentifiers;
  is_local: boolean;
  popularity: number;
}

/**
 * GET https://api.spotify.com/v1/audio-analysis/{id}
 *
 * EXAMPLE:

 * {
 *  "meta": {
 *    "analyzer_version": "4.0.0",
 *    "platform": "Linux",
 *    "detailed_status": "OK",
 *    "status_code": 0,
 *    "timestamp": 1456010389,
 *    "analysis_time": 9.1394,
 *   "input_process": "libvorbisfile L+R 44100->22050"
 *  },
 *  "track": {
 *    "num_samples": 5630445,
 *    "duration": 255.34898,
 *    "sample_md5": "",
 *    "offset_seconds": 0,
 *    "window_seconds": 0,
 *    "analysis_sample_rate": 22050,
 *    "analysis_channels": 1,
 *    "end_of_fade_in": 0,
 *    "start_of_fade_out": 251.73333,
 *    "loudness": -11.84,
 *    "tempo": 98.002,
 *    "tempo_confidence": 0.423,
 *    "time_signature": 4,
 *    "time_signature_confidence": 1,
 *    "key": 5,
 *    "key_confidence": 0.36,
 *    "mode": 0,
 *    "mode_confidence": 0.414,
 *    "codestring": "[REMOVED]",
 *    "code_version": 3.15,
 *    "echoprintstring": "[REMOVED]",
 *    "echoprint_version": 4.12,
 *    "synchstring": "[REMOVED]",
 *    "synch_version": 1,
 *    "rhythmstring": "[REMOVED]",
 *    "rhythm_version": 1
 *  },
 *  "bars": [
 *    {
 *      "start": 0.06443,
 *      "duration": 2.44911,
 *      "confidence": 0.057
 *    },
 *    ...
 *  ],
 *  "beats": [
 *    {
 *      "start": 0.06443,
 *      "duration": 2.44911,
 *      "confidence": 0.057
 *    },
 *    ...
 *  ],
 *  "tatums": [
 *    {
 *      "start": 0.06443,
 *      "duration": 2.44911,
 *      "confidence": 0.057
 *    },
 *    ...
 *  ],
 *  "sections": [
 *    {
 *      "start": 237.02356,
 *      "duration": 18.32542,
 *      "confidence": 1,
 *      "loudness": -20.074,
 *      "tempo": 98.253,
 *      "tempo_confidence": 0.767,
 *      "key": 5,
 *      "key_confidence": 0.327,
 *      "mode": 1,
 *      "mode_confidence": 0.566,
 *      "time_signature": 4,
 *      "time_signature_confidence": 1
 *    },
 *    ...
 *  ],
 *  "segments": [
 *    {
 *      "start": 252.15601,
 *      "duration": 3.19297,
 *      "confidence": 0.522,
 *      "loudness_start": -23.356,
 *      "loudness_max_time": 0.06971,
 *      "loudness_max": -18.121,
 *      "loudness_end": -60,
 *      "pitches": [
 *        0.709,
 *        0.092,
 *        0.196,
 *        0.084,
 *        0.352,
 *        0.134,
 *        0.161,
 *        1,
 *        0.17,
 *        0.161,
 *        0.211,
 *        0.15
 *      ],
 *      "timbre": [
 *        23.312,
 *        -7.374,
 *        -45.719,
 *        294.874,
 *        51.869,
 *        -79.384,
 *        -89.048,
 *        143.322,
 *        -4.676,
 *        -51.303,
 *        -33.274,
 *        -19.037
 *      ]
 *    }
 *  ]
 * }
 */

export interface GetAnAudioAnalysisResponse {
  track: {
    end_of_fade_in: number,
    start_of_fade_out: number,
    tempo: number,
    tempo_confidence: number,
    time_signature: number,
    time_signature_confidence: number,
    key: number,
    key_confidence: number,
    mode: number,
    mode_confidence: number,
  };
  bars: GetAnAudioAnalysisResponseTimeInterval[];
  beats: GetAnAudioAnalysisResponseTimeInterval[];
  tatums: GetAnAudioAnalysisResponseTimeInterval[];
  sections: GetAnAudioAnalysisResponseSection[];
  segments: GetAnAudioAnalysisResponseSegment[];
}

/**
 * GET https://api.spotify.com/v1/audio-features/{id}
 *
 * EXAMPLE:
 *
 * {
 *   "danceability": 0.735,
 *   "energy": 0.578,
 *   "key": 5,
 *   "loudness": -11.84,
 *   "mode": 0,
 *   "speechiness": 0.0461,
 *   "acousticness": 0.514,
 *   "instrumentalness": 0.0902,
 *   "liveness": 0.159,
 *   "valence": 0.624,
 *   "tempo": 98.002,
 *   "type": "audio_features",
 *   "id": "06AKEBrKUckW0KREUWRnvT",
 *   "uri": "spotify:track:06AKEBrKUckW0KREUWRnvT",
 *   "track_href": "https://api.spotify.com/v1/tracks/06AKEBrKUckW0KREUWRnvT",
 *   "analysis_url": "https://api.spotify.com/v1/audio-analysis/06AKEBrKUckW0KREUWRnvT",
 *   "duration_ms": 255349,
 *   "time_signature": 4
 * }
 */

export interface GetAudioFeaturesResponse {
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  type: string;
  id: string;
  uri: string;
  track_href: string;
  analysis_url: string;
  duration_ms: number;
  time_signature: number;
}

/**
 * GET https://api.spotify.com/v1/search
 *
 * EXAMPLE:
 *
{
    tracks: {
      href: 'https://api.spotify.com/v1/search?query=Muse&type=track&market=US&offset=0&limit=2',
      items: [
        {
          album: {
            album_type: 'album',
            artists: [
              {
                external_urls: {
                  spotify: 'https://open.spotify.com/artist/12Chz98pHFMPJEknJQMWvI',
                },
                href: 'https://api.spotify.com/v1/artists/12Chz98pHFMPJEknJQMWvI',
                id: '12Chz98pHFMPJEknJQMWvI',
                name: 'Muse',
                type: 'artist',
                uri: 'spotify:artist:12Chz98pHFMPJEknJQMWvI',
              },
            ],
            external_urls: {
              spotify: 'https://open.spotify.com/album/0eFHYz8NmK75zSplL5qlfM',
            },
            href: 'https://api.spotify.com/v1/albums/0eFHYz8NmK75zSplL5qlfM',
            id: '0eFHYz8NmK75zSplL5qlfM',
            images: [
              {
                height: 640,
                url: 'https://i.scdn.co/image/6e1be3ceda70250c701caee5a16bef205e94bc98',
                width: 640,
              },
              {
                height: 300,
                url: 'https://i.scdn.co/image/28752dcf4b27ba14c1fc62f04ff469aa53c113d7',
                width: 300,
              },
              {
                height: 64,
                url: 'https://i.scdn.co/image/26098aaa50a3450f0bac8f1a7d7677accf3f3cb6',
                width: 64,
              },
            ],
            name: 'The Resistance',
            release_date: '2009-09-10',
            release_date_precision: 'day',
            total_tracks: 11,
            type: 'album',
            uri: 'spotify:album:0eFHYz8NmK75zSplL5qlfM',
          },
          artists: [
            {
              external_urls: {
                spotify: 'https://open.spotify.com/artist/12Chz98pHFMPJEknJQMWvI',
              },
              href: 'https://api.spotify.com/v1/artists/12Chz98pHFMPJEknJQMWvI',
              id: '12Chz98pHFMPJEknJQMWvI',
              name: 'Muse',
              type: 'artist',
              uri: 'spotify:artist:12Chz98pHFMPJEknJQMWvI',
            },
          ],
          disc_number: 1,
          duration_ms: 304840,
          explicit: false,
          external_ids: {
            isrc: 'GBAHT0900320',
          },
          external_urls: {
            spotify: 'https://open.spotify.com/track/4VqPOruhp5EdPBeR92t6lQ',
          },
          href: 'https://api.spotify.com/v1/tracks/4VqPOruhp5EdPBeR92t6lQ',
          id: '4VqPOruhp5EdPBeR92t6lQ',
          is_local: false,
          is_playable: true,
          name: 'Uprising',
          popularity: 75,
          preview_url:
          'https://p.scdn.co/mp3-preview/104ad0ea32356b9f3b2e95a8610f504c90b0026b?cid=774b29d4f13844c495f206cafdad9c86',
          track_number: 1,
          type: 'track',
          uri: 'spotify:track:4VqPOruhp5EdPBeR92t6lQ',
        },
        {
          album: {
            album_type: 'album',
            artists: [
              {
                external_urls: {
                  spotify: 'https://open.spotify.com/artist/12Chz98pHFMPJEknJQMWvI',
                },
                href: 'https://api.spotify.com/v1/artists/12Chz98pHFMPJEknJQMWvI',
                id: '12Chz98pHFMPJEknJQMWvI',
                name: 'Muse',
                type: 'artist',
                uri: 'spotify:artist:12Chz98pHFMPJEknJQMWvI',
              },
            ],
            external_urls: {
              spotify: 'https://open.spotify.com/album/0lw68yx3MhKflWFqCsGkIs',
            },
            href: 'https://api.spotify.com/v1/albums/0lw68yx3MhKflWFqCsGkIs',
            id: '0lw68yx3MhKflWFqCsGkIs',
            images: [
              {
                height: 640,
                url: 'https://i.scdn.co/image/9e5288926fadb82f873ccf2b45300c3a6f65fa14',
                width: 640,
              },
              {
                height: 300,
                url: 'https://i.scdn.co/image/f1cad0d6974d6236abd07a59106e8450d85cae24',
                width: 300,
              },
              {
                height: 64,
                url: 'https://i.scdn.co/image/81a3f82578dc938c53efdcb405f6a3d3ebbf009f',
                width: 64,
              },
            ],
            name: 'Black Holes And Revelations',
            release_date: '2006-06-19',
            release_date_precision: 'day',
            total_tracks: 12,
            type: 'album',
            uri: 'spotify:album:0lw68yx3MhKflWFqCsGkIs',
          },
          artists: [
            {
              external_urls: {
                spotify: 'https://open.spotify.com/artist/12Chz98pHFMPJEknJQMWvI',
              },
              href: 'https://api.spotify.com/v1/artists/12Chz98pHFMPJEknJQMWvI',
              id: '12Chz98pHFMPJEknJQMWvI',
              name: 'Muse',
              type: 'artist',
              uri: 'spotify:artist:12Chz98pHFMPJEknJQMWvI',
            },
          ],
          disc_number: 1,
          duration_ms: 212439,
          explicit: false,
          external_ids: {
            isrc: 'GBAHT0500593',
          },
          external_urls: {
            spotify: 'https://open.spotify.com/track/3lPr8ghNDBLc2uZovNyLs9',
          },
          href: 'https://api.spotify.com/v1/tracks/3lPr8ghNDBLc2uZovNyLs9',
          id: '3lPr8ghNDBLc2uZovNyLs9',
          is_local: false,
          is_playable: true,
          name: 'Supermassive Black Hole',
          popularity: 72,
          preview_url:
          'https://p.scdn.co/mp3-preview/7ab3e38ce1671da3a185d8685981983a6f39b7bd?cid=774b29d4f13844c495f206cafdad9c86',
          track_number: 3,
          type: 'track',
          uri: 'spotify:track:3lPr8ghNDBLc2uZovNyLs9',
        },
      ],
      limit: 2,
      next: 'https://api.spotify.com/v1/search?query=Muse&type=track&market=US&offset=2&limit=2',
      offset: 0,
      previous: null,
      total: 13717,
    },
  }
*/

type TrackAlbum = {
  images: Image[];
};

export type Track = {
  album: TrackAlbum,
  name: string;
  id: string;
  duration_ms: string;
};

export interface SearchTrackResponseData {
  tracks: {
    href: string;
    items: Track[];
    limit: number;
    next: string;
    offset: number;
    previous: string | null;
    total:  number;
  };
}

export interface SearchTrackSuccessResponse extends BaseSpotifyServerSuccessResponse {
  data: SearchTrackResponseData;
}
export interface SearchTrackFailureResponse {
  error: SpotifyErrorResponse;
}
