export function searchTracksMock() {
  const mocks: object = {
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
  };

  return mocks;
}
