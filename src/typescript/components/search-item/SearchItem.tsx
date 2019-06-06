import * as React from 'react';
import { msToMinutes } from '../../utils/misc';

interface SearchItemProps {
  id: string;
  name: string;
  thumbnailURL: string;
  durationMs: string;
  handleClick: (id: string) => void;
  active: boolean;
}

const SearchItem: React.FC<SearchItemProps> = (props: SearchItemProps) => {
  const onItemClick = () => {
    props.handleClick(props.id);
  };

  return (
    (
      <div className={`search-item ${props.active ? 'active' : ''}`} onClick={onItemClick}>
          <div className="thumbnail">
            <img
              src={props.thumbnailURL}
              alt="thumbnail"
              />
          </div>
          <div className="info">
            <div className="title">
              {props.name}
            </div>
            <div className="duration">
              Duration: {msToMinutes(parseInt(props.durationMs, 10))}
            </div>
          </div>
      </div>
    )
  );
};

export default SearchItem;
