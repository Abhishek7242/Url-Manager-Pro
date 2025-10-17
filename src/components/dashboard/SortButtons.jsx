import React, { useContext, useState } from "react";
import { FiFilter, FiChevronDown } from "react-icons/fi";
import "../CSS/SortButtons.css";
import UrlContext from "../../context/url_manager/UrlContext";

export default function SortButtons({ onSortChange }) {
      const context = useContext(UrlContext);
      const {
      
        activeSort,
        setActiveSort,
      } = context;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSelect = (sortKey) => {
    setActiveSort(sortKey);
    setDropdownOpen(false);
    if (onSortChange) onSortChange(sortKey);
  };

  return (
    <div className="sort-buttons">
      {/* Active Filter button */}
      <button className="sort-btn active">
        <FiFilter className="icon" /> Date
      </button>

      {/* Dropdown */}
      <div className="dropdown">
        <button
          className="sort-btn dropdown-toggle"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          {activeSort === "date"
            ? "Date Added"
            : activeSort === "title"
            ? "Title"
            : activeSort === "clicks"
            ? "Clicks"
            : "Status"}
          <FiChevronDown className="icon" />
        </button>

        {dropdownOpen && (
          <ul className="dropdown-menu">
            <li onClick={() => handleSelect("date")}>Date Added</li>
            <li onClick={() => handleSelect("title")}>Title</li>
            <li onClick={() => handleSelect("clicks")}>Clicks</li>
          </ul>
        )}
      </div>
    </div>
  );
}
