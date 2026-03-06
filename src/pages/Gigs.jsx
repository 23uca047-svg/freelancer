<<<<<<< HEAD
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GigCard from "../components/GigCard";
import "./Gigs.css";
import { gigsWithPrice } from "../data/gigsData";

function Gigs() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2>Login Required</h2>
        <p>Please log in to view gigs and place orders.</p>
        <button
          onClick={() => navigate("/login")}
          style={{
            marginTop: "20px",
            padding: "12px 30px",
            background: "#1dbf73",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  const searchQuery = new URLSearchParams(location.search).get("search");
  const categoryQuery = new URLSearchParams(location.search).get("category");

  const gigs = gigsWithPrice;

  const filteredGigs = gigs.filter((gig) => {
    const matchesSearch = searchQuery
      ? gig.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = categoryQuery
      ? gig.category === categoryQuery
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="gigs-page">
      <h2>
        {searchQuery && `Results for "${searchQuery}"`}
        {categoryQuery && `Category: ${categoryQuery}`}
        {!searchQuery && !categoryQuery && "Available Gigs"}
      </h2>

      <div className="gigs-container">
        {filteredGigs.length > 0 ? (
          filteredGigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))
        ) : (
          <p>No gigs found</p>
        )}
      </div>
    </div>
  );
}

=======
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GigCard from "../components/GigCard";
import EmptyState from "../components/common/EmptyState";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { filterGigs, getGigCategories, getMarketplaceGigs } from "../services/gigService";
import useDebouncedValue from "../hooks/useDebouncedValue";
import "./Gigs.css";

function Gigs() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("search") || "";
  const categoryQuery = params.get("category") || "";

  const [searchValue, setSearchValue] = useState(searchQuery);
  const [category, setCategory] = useState(categoryQuery);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const debouncedSearch = useDebouncedValue(searchValue, 300);

  useEffect(() => {
    let mounted = true;

    getMarketplaceGigs()
      .then((results) => {
        if (!mounted) return;
        setGigs(results);
        setError("");
      })
      .catch((fetchError) => {
        console.error("Failed to load gigs", fetchError);
        if (!mounted) return;
        setError("Unable to load gigs right now.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => getGigCategories(gigs), [gigs]);

  const filteredGigs = useMemo(
    () =>
      filterGigs(gigs, {
        search: debouncedSearch,
        category,
        minPrice: 0,
        maxPrice,
      }),
    [gigs, debouncedSearch, category, maxPrice]
  );

  const handleResetFilters = () => {
    setSearchValue("");
    setCategory("");
    setMaxPrice(10000);
    navigate("/gigs");
  };

  if (loading) {
    return <LoadingState title="Loading gigs" text="Fetching marketplace gigs and filters." />;
  }

  if (error) {
    return <ErrorState title="Marketplace unavailable" text={error} actionText="Retry" onAction={() => window.location.reload()} />;
  }

  return (
    <div className="gigs-page">
      <header className="gigs-header">
        <h2>Find The Right Freelancer</h2>
        <p>Explore vetted services with transparent pricing and delivery windows.</p>
      </header>

      <section className="market-controls">
        <label className="control-group" htmlFor="gig-search">
          <span>Search gigs</span>
          <input
            id="gig-search"
            type="text"
            placeholder="Try web design, logo, SEO..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </label>

        <label className="control-group" htmlFor="gig-category">
          <span>Category</span>
          <select
            id="gig-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((categoryValue) => (
              <option key={categoryValue} value={categoryValue}>
                {categoryValue}
              </option>
            ))}
          </select>
        </label>

        <label className="control-group" htmlFor="gig-price">
          <span>Max price: Rs {maxPrice}</span>
          <input
            id="gig-price"
            type="range"
            min="500"
            max="10000"
            step="100"
            value={maxPrice}
            onChange={(event) => setMaxPrice(Number(event.target.value))}
          />
        </label>

        <button type="button" className="secondary-btn" onClick={handleResetFilters}>
          Reset
        </button>
      </section>

      <div className="results-meta">
        <strong>{filteredGigs.length}</strong> gigs matched
      </div>

      <div className="gigs-container">
        {filteredGigs.length > 0 ? (
          filteredGigs.map((gig) => <GigCard key={gig.id} gig={gig} />)
        ) : (
          <EmptyState
            title="No gigs matched your filters"
            text="Try adjusting category, search text, or max budget to see more services."
          />
        )}
      </div>
    </div>
  );
}

>>>>>>> d2cf519 (Update project files)
export default Gigs;