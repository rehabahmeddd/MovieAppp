import React from 'react';
import '../App.css'; 

const SearchBar = ({ setSearchTerm, setSearchBy }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search..."
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <select
        onChange={(e) => setSearchBy(e.target.value)}
        className="search-select"
      >
        <option value="title">Title</option>
        <option value="genre">Genre</option>
      </select>
    </div>
  );
};

export default SearchBar;
