import { SearchTrackResponseData } from '../../../../types/spotify-responses';

export function searchTracksMock() {
  const mocks: SearchTrackResponseData = {
    tracks: {
      href: 'https://api.spotify.com/v1/search?query=Taylor+Swift&type=track&market=GB&offset=0&limit=2',
      items: [
        {
          album: {
            album_type: 'album',
            artists: [
              {
                external_urls: {
                  spotify: 'https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02',
                },
                href: 'https://api.spotify.com/v1/artists/06HL4z0CvFAxyc27GXpf02',
                id: '06HL4z0CvFAxyc27GXpf02',
                name: 'Taylor Swift',
                type: 'artist',
                uri: 'spotify:artist:06HL4z0CvFAxyc27GXpf02',
              },
            ],
            external_urls: {
              spotify: 'https://open.spotify.com/album/6DEjYFkNZh67HP7R9PSZvv',
            },
            href: 'https://api.spotify.com/v1/albums/6DEjYFkNZh67HP7R9PSZvv',
            id: '6DEjYFkNZh67HP7R9PSZvv',
            images: [
              {
                height: 640,
                url: 'https://i.scdn.co/image/ae2edb70f5e67fc5f7f8f92b2b0f3e846699b447',
                width: 640,
              },
              {
                height: 300,
                url: 'https://i.scdn.co/image/790a5152a158b8088b7e7fd5730c450d07c3fc49',
                width: 300,
              },
              {
                height: 64,
                url: 'https://i.scdn.co/image/2731edb2b293a2d8e37d4945a55b6d16b1a79105',
                width: 64,
              },
            ],
            name: 'reputation',
            release_date: '2017-11-10',
            release_date_precision: 'day',
            total_tracks: 15,
            type: 'album',
            uri: 'spotify:album:6DEjYFkNZh67HP7R9PSZvv',
          },
          artists: [
            {
              external_urls: {
                spotify: 'https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02',
              },
              href: 'https://api.spotify.com/v1/artists/06HL4z0CvFAxyc27GXpf02',
              id: '06HL4z0CvFAxyc27GXpf02',
              name: 'Taylor Swift',
              type: 'artist',
              uri: 'spotify:artist:06HL4z0CvFAxyc27GXpf02',
            },
            {
              external_urls: {
                spotify: 'https://open.spotify.com/artist/6eUKZXaKkcviH0Ku9w2n3V',
              },
              href: 'https://api.spotify.com/v1/artists/6eUKZXaKkcviH0Ku9w2n3V',
              id: '6eUKZXaKkcviH0Ku9w2n3V',
              name: 'Ed Sheeran',
              type: 'artist',
              uri: 'spotify:artist:6eUKZXaKkcviH0Ku9w2n3V',
            },
            {
              external_urls: {
                spotify: 'https://open.spotify.com/artist/1RyvyyTE3xzB2ZywiAwp0i',
              },
              href: 'https://api.spotify.com/v1/artists/1RyvyyTE3xzB2ZywiAwp0i',
              id: '1RyvyyTE3xzB2ZywiAwp0i',
              name: 'Future',
              type: 'artist',
              uri: 'spotify:artist:1RyvyyTE3xzB2ZywiAwp0i',
            },
          ],
          disc_number: 1,
          duration_ms: 244826,
          explicit: false,
          external_ids: {
            isrc: 'USCJY1750004',
          },
          external_urls: {
            spotify: 'https://open.spotify.com/track/2x0WlnmfG39ZuDmstl9xfX',
          },
          href: 'https://api.spotify.com/v1/tracks/2x0WlnmfG39ZuDmstl9xfX',
          id: '2x0WlnmfG39ZuDmstl9xfX',
          is_local: false,
          is_playable: true,
          name: 'End Game',
          popularity: 71,
          preview_url: null,
          track_number: 2,
          type: 'track',
          uri: 'spotify:track:2x0WlnmfG39ZuDmstl9xfX',
        },
        {
          album: {
            album_type: 'album',
            artists: [
              {
                external_urls: {
                  spotify: 'https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02',
                },
                href: 'https://api.spotify.com/v1/artists/06HL4z0CvFAxyc27GXpf02',
                id: '06HL4z0CvFAxyc27GXpf02',
                name: 'Taylor Swift',
                type: 'artist',
                uri: 'spotify:artist:06HL4z0CvFAxyc27GXpf02',
              },
            ],
            available_markets: [
              'AD',
              'AE',
              'AR',
              'AT',
              'AU',
              'BE',
              'BG',
              'BH',
              'BO',
              'BR',
              'CA',
              'CH',
              'CL',
              'CO',
              'CR',
              'CY',
              'CZ',
              'DE',
              'DK',
              'DO',
              'DZ',
              'EC',
              'EE',
              'EG',
              'ES',
              'FI',
              'FR',
              'GB',
              'GR',
              'GT',
              'HK',
              'HN',
              'HU',
              'ID',
              'IE',
              'IL',
              'IN',
              'IS',
              'IT',
              'JO',
              'JP',
              'KW',
              'LB',
              'LI',
              'LT',
              'LU',
              'LV',
              'MA',
              'MC',
              'MT',
              'MX',
              'MY',
              'NI',
              'NL',
              'NO',
              'NZ',
              'OM',
              'PA',
              'PE',
              'PH',
              'PL',
              'PS',
              'PT',
              'PY',
              'QA',
              'RO',
              'SA',
              'SE',
              'SG',
              'SK',
              'SV',
              'TH',
              'TN',
              'TR',
              'TW',
              'US',
              'UY',
              'VN',
              'ZA',
            ],
            external_urls: {
              spotify: 'https://open.spotify.com/album/1Hrs3jLGexOvBoaPMoOQYJ',
            },
            href: 'https://api.spotify.com/v1/albums/1Hrs3jLGexOvBoaPMoOQYJ',
            id: '1Hrs3jLGexOvBoaPMoOQYJ',
            images: [
              {
                height: 640,
                url: 'https://i.scdn.co/image/77eb7c17cafe550339785938bb41d00f1b7beb2b',
                width: 640,
              },
              {
                height: 300,
                url: 'https://i.scdn.co/image/77eb7c17cafe5502a6ecf352f22a95ef02268e5d',
                width: 300,
              },
              {
                height: 64,
                url: 'https://i.scdn.co/image/77eb7c17cafe55016c1825d61fdcdfd7f27a6d1c',
                width: 64,
              },
            ],
            name: 'reputation (Big Machine Radio Release Special)',
            release_date: '2017-11-08',
            release_date_precision: 'day',
            total_tracks: 31,
            type: 'album',
            uri: 'spotify:album:1Hrs3jLGexOvBoaPMoOQYJ',
          },
          artists: [
            {
              external_urls: {
                spotify: 'https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02',
              },
              href: 'https://api.spotify.com/v1/artists/06HL4z0CvFAxyc27GXpf02',
              id: '06HL4z0CvFAxyc27GXpf02',
              name: 'Taylor Swift',
              type: 'artist',
              uri: 'spotify:artist:06HL4z0CvFAxyc27GXpf02',
            },
          ],
          available_markets: [
            'AD',
            'AE',
            'AR',
            'AT',
            'AU',
            'BE',
            'BG',
            'BH',
            'BO',
            'BR',
            'CA',
            'CH',
            'CL',
            'CO',
            'CR',
            'CY',
            'CZ',
            'DE',
            'DK',
            'DO',
            'DZ',
            'EC',
            'EE',
            'EG',
            'ES',
            'FI',
            'FR',
            'GB',
            'GR',
            'GT',
            'HK',
            'HN',
            'HU',
            'ID',
            'IE',
            'IL',
            'IN',
            'IS',
            'IT',
            'JO',
            'JP',
            'KW',
            'LB',
            'LI',
            'LT',
            'LU',
            'LV',
            'MA',
            'MC',
            'MT',
            'MX',
            'MY',
            'NI',
            'NL',
            'NO',
            'NZ',
            'OM',
            'PA',
            'PE',
            'PH',
            'PL',
            'PS',
            'PT',
            'PY',
            'QA',
            'RO',
            'SA',
            'SE',
            'SG',
            'SK',
            'SV',
            'TH',
            'TN',
            'TR',
            'TW',
            'US',
            'UY',
            'VN',
            'ZA',
          ],
          disc_number: 1,
          duration_ms: 211853,
          explicit: false,
          external_ids: {
            isrc: 'USCJY1750000',
          },
          external_urls: {
            spotify: 'https://open.spotify.com/track/1JbR9RDP3ogVNEWFgNXAjh',
          },
          href: 'https://api.spotify.com/v1/tracks/1JbR9RDP3ogVNEWFgNXAjh',
          id: '1JbR9RDP3ogVNEWFgNXAjh',
          is_local: false,
          name: 'Look What You Made Me Do',
          popularity: 73,
          preview_url: null,
          track_number: 12,
          type: 'track',
          uri: 'spotify:track:1JbR9RDP3ogVNEWFgNXAjh',
        },
      ],
      limit: 2,
      next: 'https://api.spotify.com/v1/search?query=Taylor+Swift&type=track&market=GB&offset=2&limit=2',
      offset: 0,
      previous: null,
      total: 7924,
    },
  };

  return mocks;
}
