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
          src="https://cdn3.iconfinder.com/data/icons/website-panel-icons/128/test1-10-512.png"
          alt="thumbnail"
          />
      </div>
      <div className="info">
        <div className="title">
          Sample title
        </div>
        <div className="duration">
          Duration: 12min
        </div>
      </div>
  </div>
);

export default SearchItem;
