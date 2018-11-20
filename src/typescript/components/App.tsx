import * as React from 'react';
import Nav from './Nav';
import CircleCanvas from './CircleCanvas';

interface AppProps {}

export default function ({}: AppProps) {
  return (
    <React.Fragment>
      <Nav />
      <CircleCanvas />
    </React.Fragment>
  );
}
