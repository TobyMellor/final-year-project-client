/* tslint:disable max-line-length */

import { sample } from '../mocker';

export function getAnArtistMock() {
  const mocks = [
    // KIDS SEE GHOSTS
    '{"external_urls":{"spotify":"https://open.spotify.com/artist/2hPgGN4uhvXAxiXQBIXOmE"},"followers":{"href":null,"total":131323},"genres":["hip hop","pop rap","rap"],"href":"https://api.spotify.com/v1/artists/2hPgGN4uhvXAxiXQBIXOmE","id":"2hPgGN4uhvXAxiXQBIXOmE","images":[{"height":640,"url":"https://i.scdn.co/image/e7df5661e0e360ebbeb065a9b4fde3db73823729","width":640},{"height":320,"url":"https://i.scdn.co/image/935d8538d6f7330b4939de1124e9950f2a243210","width":320},{"height":160,"url":"https://i.scdn.co/image/248a69a43395accbc0038e98c54fc63065b41b55","width":160}],"name":"KIDS SEE GHOSTS","popularity":73,"type":"artist","uri":"spotify:artist:2hPgGN4uhvXAxiXQBIXOmE"}',

    // Arctic Monkeys
    '{"external_urls":{"spotify":"https://open.spotify.com/artist/7Ln80lUS6He07XvHI8qqHH"},"followers":{"href":null,"total":6665018},"genres":["garage rock","indie rock","modern rock","permanent wave","rock","sheffield indie"],"href":"https://api.spotify.com/v1/artists/7Ln80lUS6He07XvHI8qqHH","id":"7Ln80lUS6He07XvHI8qqHH","images":[{"height":640,"url":"https://i.scdn.co/image/ed0552e9746ed2bbf04ae4bcb5525700ca31522d","width":640},{"height":320,"url":"https://i.scdn.co/image/b435e99aa7f1e27db56b6a4dc9df85e5636b22d6","width":320},{"height":160,"url":"https://i.scdn.co/image/73c4e49abed008fe0c5e4f1437b8b486c7670ecd","width":160}],"name":"Arctic Monkeys","popularity":85,"type":"artist","uri":"spotify:artist:7Ln80lUS6He07XvHI8qqHH"}',

    // Drake
    '{"external_urls":{"spotify":"https://open.spotify.com/artist/3TVXtAsR1Inumwj472S9r4"},"followers":{"href":null,"total":27605093},"genres":["canadian hip hop","canadian pop","hip hop","pop rap","rap"],"href":"https://api.spotify.com/v1/artists/3TVXtAsR1Inumwj472S9r4","id":"3TVXtAsR1Inumwj472S9r4","images":[{"height":640,"url":"https://i.scdn.co/image/012ecd119617ac24ab56620ace4b81735b172686","width":640},{"height":320,"url":"https://i.scdn.co/image/55e3fb26d67b4d71321440b3a440eecd9d8f20f7","width":320},{"height":160,"url":"https://i.scdn.co/image/ad10179d5f27ba77c7d6c95abd6e26f6a227e0d5","width":160}],"name":"Drake","popularity":100,"type":"artist","uri":"spotify:artist:3TVXtAsR1Inumwj472S9r4"}',
  ];

  return sample(mocks);
}
