import * as React from 'react';

interface AppProps {
  message: string;
}

export default function ({ message }: AppProps) {
  return <h1>Hey there, {message}</h1>;
}
