const BrowseFilters = ({
    showFilters,
    setShowFilters,
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
    handleApplyFilters
}) => {
    return (
        <>
            {/* Filter toggle button */}
            <button
                type="button"
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
            >
                {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

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
                                value={minPrice}
                                disabled={freeOnly}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                        </div>

                        <div className="filter-field">
                            <label>Max Price</label>
                            <input
                                type="number"
                                value={maxPrice}
                                disabled={freeOnly}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Row 3: Apply filters button */}
                    <div className="filter-row">
                        <button type="button" onClick={handleApplyFilters}>
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default BrowseFilters