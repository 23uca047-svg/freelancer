<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  // 🔐 Redirect to login if not authenticated
  if (!user) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2>Welcome to Freelance Clone</h2>
        <p>Please log in to get started.</p>
        <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/login")}
            style={{
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
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "12px 30px",
              background: "white",
              color: "#1dbf73",
              border: "2px solid #1dbf73",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  const services = [
    "Website Development",
    "Graphic Design",
    "Video Editing",
    "Digital Marketing",
    "Content Writing",
  ];

  const handleSearch = () => {
    if (query.trim() !== "") {
      navigate(`/gigs?search=${query}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="home">
      <div className="home-content">
        <h1>Our freelancers will take it from here</h1>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search for any service..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearch}>🔍</button>
        </div>

        <div className="services">
          {services.map((service, index) => (
            <button
              key={index}
              className="service-btn"
              onClick={() => navigate(`/gigs?category=${service}`)}
            >
              {service}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

=======
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  const services = [
    "Website Design",
    "WordPress",
    "Logo Design",
    "SEO",
    "Digital Marketing",
  ];

  const trustedBy = ["Meta", "Google", "Netflix", "P&G", "PayPal"];

  const handleSearch = () => {
    if (query.trim() !== "") {
      navigate(`/gigs?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="home">
      <div className="home-content">
        <p className="eyebrow">Find your next freelancer</p>
        <h1>Find the perfect freelance service for your business</h1>
        <p className="home-subtitle">From strategy to shipping, work with specialists ready to start today.</p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Try web design, logo, SEO, content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        <div className="services" aria-label="Popular services">
          <span>Popular:</span>
          {services.map((service, index) => (
            <button
              key={index}
              className="service-btn"
              onClick={() => navigate(`/gigs?category=${service}`)}
            >
              {service}
            </button>
          ))}
        </div>

        <div className="hero-actions">
          {user ? (
            <button onClick={() => navigate(user.role === "seller" ? "/seller-dashboard" : "/buyer-dashboard")}>Go to Dashboard</button>
          ) : (
            <>
              <button onClick={() => navigate("/signup")}>Join as Freelancer</button>
              <button className="outline" onClick={() => navigate("/login")}>Sign In</button>
            </>
          )}
        </div>
      </div>

      <div className="trust-strip" aria-label="Trusted by brands">
        <span>Trusted by:</span>
        {trustedBy.map((brand) => (
          <strong key={brand}>{brand}</strong>
        ))}
      </div>
    </div>
  );
}

>>>>>>> d2cf519 (Update project files)
export default Home;