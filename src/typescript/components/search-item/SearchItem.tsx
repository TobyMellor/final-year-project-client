import * as React from 'react';

interface SearchItemProps {
  name: string;
  thumbnail: string;
  duration: string;
}

const SearchItem: React.FC<SearchItemProps> = (props: SearchItemProps) => (
  <div className="search-item">
    hello world
  </div>
);

export default SearchItem;
