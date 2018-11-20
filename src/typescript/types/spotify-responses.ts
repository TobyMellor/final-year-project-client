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
