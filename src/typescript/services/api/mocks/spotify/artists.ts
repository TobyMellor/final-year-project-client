/* tslint:disable max-line-length */

import { sample } from '../mocker';

export function getAnArtistMock() {
  const mocks = [
    // Drake
    '{"external_urls":{"spotify":"https://open.spotify.com/artist/3TVXtAsR1Inumwj472S9r4"},"followers":{"href":null,"total":27605093},"genres":["canadian hip hop","canadian pop","hip hop","pop rap","rap"],"href":"https://api.spotify.com/v1/artists/3TVXtAsR1Inumwj472S9r4","id":"3TVXtAsR1Inumwj472S9r4","images":[{"height":640,"url":"https://i.scdn.co/image/012ecd119617ac24ab56620ace4b81735b172686","width":640},{"height":320,"url":"https://i.scdn.co/image/55e3fb26d67b4d71321440b3a440eecd9d8f20f7","width":320},{"height":160,"url":"https://i.scdn.co/image/ad10179d5f27ba77c7d6c95abd6e26f6a227e0d5","width":160}],"name":"Drake","popularity":100,"type":"artist","uri":"spotify:artist:3TVXtAsR1Inumwj472S9r4"}',

    // Taylor swift
    '{"external_urls":{"spotify":"https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02"},"followers":{"href":null,"total":19467051},"genres":["dance pop","pop","post-teen pop"],"href":"https://api.spotify.com/v1/artists/06HL4z0CvFAxyc27GXpf02","id":"06HL4z0CvFAxyc27GXpf02","images":[{"height":640,"url":"https://i.scdn.co/image/62b33d12e2b9a033cf77585f6e3d4b2c6b3a63a1","width":640},{"height":320,"url":"https://i.scdn.co/image/9ab124f3323d161f87fc9b7f8b82ab1717483b3a","width":320},{"height":160,"url":"https://i.scdn.co/image/d28b46cd7e1b7336d1688d462085535963a77311","width":160}],"name":"Taylor Swift","popularity":91,"type":"artist","uri":"spotify:artist:06HL4z0CvFAxyc27GXpf02"}',
  ];

  return sample(mocks);
}
