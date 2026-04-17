const BrowseFilters = ({
    showFilters,
    setShowFilters,
    searchTerm,
    setSearchTerm,
    handleSearch,
    handleSearchKeyDown,
    levelFilter,
    setLevelFilter,
    sortBy,
    setSortBy,
    freeOnly,
    setFreeOnly,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    handleApplyFilters,
    handleClearFilters,
    priceRangeError
}) => {
    return (
        <>
            {/* Search bar - above filters panel */}
            <div className="browse-search-bar">
                <div className="browse-search-field">
                    <label htmlFor="browse-search">Search classes</label>
                    <input
                        id="browse-search"
                        type="text"
                        placeholder="Search by title, style or location"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearchKeyDown} //pressing enter applies search only
                    />
                </div>

                <button
                    type="button"
                    className="browse-search-btn"
                    onClick={handleSearch}
                >
                    Search
                </button>
            </div>

            {/* Filter toggle intro + button */}
            <div className="filter-toggle-section">
                <p className="filter-toggle-text">Refine your results using filters</p>

                <button
                    type="button"
                    className="filter-toggle"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    {showFilters ? "Hide Filter Options" : "Show Filter Options"}
                </button>
            </div>

            {/* Filter panel */}
            {showFilters && (
                <div className="filter-panel">
                    {/* Row 1: Level + Sort */}
                    <div className="filter-row two-col">
                        <div className="filter-field">
                            <label>Level</label>
                            <select
                                value={levelFilter}
                                onChange={(e) => setLevelFilter(e.target.value)}
                            >
                                <option value="">Any level</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Open">Open level</option>
                            </select>
                        </div>

                        <div className="filter-field">
                            <label>Sort by</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="date_asc">Soonest date</option>
                                <option value="price_asc">Price: lowest first</option>
                                <option value="price_desc">Price: highest first</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Free + Min + Max on one line */}
                    <div className="filter-row three-col">
                        <label className="filter-checkbox">
                            Free only
                            <input
                                type="checkbox"
                                checked={freeOnly}
                                onChange={(e) => {
                                    const checked = e.target.checked
                                    setFreeOnly(checked)

                                    // if user selects "Free only", clear min/max to avoid stale values
                                    if (checked) {
                                        setMinPrice("")
                                        setMaxPrice("")
                                    }
                                }}
                            />
                        </label>

                        <div className="filter-field">
                            <label>Min Price</label>
                            <input
                                type="number"
                                min="0"
                                value={minPrice}
                                disabled={freeOnly}
                                onChange={(e) => {
                                    const value = e.target.value

                                    // allow empty string, or any number 0 and above
                                    if (value === "" || Number(value) >= 0) {
                                        setMinPrice(value)
                                    }
                                }}
                            />
                        </div>

                        <div className="filter-field">
                            <label>Max Price</label>
                            <input
                                type="number"
                                min="0"
                                value={maxPrice}
                                disabled={freeOnly}
                                onChange={(e) => {
                                    const value = e.target.value

                                    // allow empty string, or any number 0 and above
                                    if (value === "" || Number(value) >= 0) {
                                        setMaxPrice(value)
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* show error if min price is above max price */}
                    {priceRangeError && (
                        <div className="error filter-price-error">
                            Minimum price cannot be greater than maximum price
                        </div>
                    )}

                    {/* Row 3: Apply filters + clear filters buttons */}
                    <div className="filter-actions">
                        <button type="button" onClick={handleApplyFilters}>
                            Apply Filters
                        </button>

                        <button
                            type="button"
                            className="clear-filters-btn"
                            onClick={handleClearFilters}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default BrowseFilters