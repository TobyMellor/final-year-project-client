import * as React from 'react';

interface SearchItemProps {
  name: string;
  thumbnail: string;
  duration: string;
}

const SearchItem: React.FC<SearchItemProps> = (props: SearchItemProps) => (
  <div className="search-item">
      <div className="thumbnail">
        <img
          src={props.thumbnail}
          alt="thumbnail"
          />
      </div>
      <div className="info">
        <div className="title">
          {props.name}
        </div>
        <div className="duration">
          Duration: {props.duration}
        </div>
      </div>
  </div>
);

export default SearchItem;
