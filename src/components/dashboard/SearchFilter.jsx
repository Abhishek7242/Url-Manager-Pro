import React from "react";
import { FiSearch, FiX } from "react-icons/fi";
import SortButtons from "./SortButtons";
import { motion, AnimatePresence } from "framer-motion";

const SearchFilter = ({ search, setSearch, setOpenSerch = () => false }) => {
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      document.body.style.overflow = "";
      
    }, 200);
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.section
        key="search-filter"
        className="search-card-container absolute top-0 left-0 w-full h-full blur-bg p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="search-card">
          <div className="search-header">
            <div className="search-left">
              <FiSearch /> <h4 className="text-3xl">Search & Filter</h4>
            </div>

            <div className="search-right">
              <button
                onClick={() => {
                  setOpenSerch(false);
                  setSearch("");
                }}
                className="filter-btn"
              >
                <FiX />
              </button>
            </div>
          </div>

          <div className="search-input">
            <FiSearch className="sicon" />
            <input
              placeholder="Search URLs, notes, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <SortButtons />
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
};

export default SearchFilter;
