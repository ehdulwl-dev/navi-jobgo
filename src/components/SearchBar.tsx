import React, { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "공고를 검색해주세요.",
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <form className="relative w-full max-w-xl mx-auto" onSubmit={handleSubmit}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search size={20} className="text-app-blue" />
        </div>
        <input
          type="search"
          className="w-full p-4 pl-12 text-sm border border-app-blue rounded-full focus:outline-none focus:ring-2 focus:ring-app-blue"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
        />
        {/* <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-app-blue text-white rounded-full p-2"
          aria-label="Search"
        >
          <Search size={18} />
        </button> */}
      </div>
    </form>
  );
};

export default SearchBar;
