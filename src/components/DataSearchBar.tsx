import React, { useState } from 'react';

interface DataSearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const DataSearchBar: React.FC<DataSearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
 onSearch(searchTerm)
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search CRM data..."
 value={searchTerm} // controlled component
        onChange={e => setSearchTerm(e.target.value)} // update state on change
        onKeyPress={handleKeyPress}
      />
      <button onClick={() => onSearch(searchTerm)}>Search</button>
    </div>
  );
};

export default DataSearchBar;