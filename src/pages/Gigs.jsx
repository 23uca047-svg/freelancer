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

export default Gigs;