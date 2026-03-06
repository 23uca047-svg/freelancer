import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./Navbar.css";

const utilityLinks = ["Freelance Business", "Explore", "English", "Become a Seller"];

const topCategories = [
  "Graphics & Design",
  "Video & Animation",
  "Writing & Translation",
  "AI Services",
  "Digital Marketing",
  "Music & Audio",
];

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [sellerMode, setSellerMode] = useState(() => window.localStorage.getItem("sellerMode") === "on");

  useEffect(() => {
    window.localStorage.setItem("sellerMode", sellerMode ? "on" : "off");
  }, [sellerMode]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const value = searchValue.trim();
    if (!value) return;
    navigate(`/gigs?search=${encodeURIComponent(value)}`);
  };

  const linkClass = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;
  const isSellerModeOn = Boolean(user?.role === "seller" && sellerMode);

  return (
    <header className="navbar-shell">
      <div className="navbar-utility">
        <span className="logo mark">freelance.</span>
        <div className="utility-links">
          {utilityLinks.map((item) => (
            <button key={item} type="button">{item}</button>
          ))}
        </div>
      </div>

      <nav className="navbar">
        <Link to="/" className="logo">freelance.</Link>

        <form className="nav-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search services"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </form>

        <div className="nav-links">
          {isSellerModeOn ? (
            <NavLink to="/my-gigs" className={linkClass}>My Business</NavLink>
          ) : (
            <NavLink to="/gigs" className={linkClass}>Explore</NavLink>
          )}

          {user ? (
            <>
              {user.role === "buyer" && (
                <>
                  <NavLink to="/buyer-dashboard" className={linkClass}>Buyer Dashboard</NavLink>
                  <NavLink to="/my-orders" className={linkClass}>My Orders</NavLink>
                  <NavLink to="/reviews" className={linkClass}>Reviews</NavLink>
                </>
              )}

              {user.role === "seller" && (
                <>
                  <button
                    type="button"
                    className="mode-toggle"
                    onClick={() => setSellerMode((prev) => !prev)}
                  >
                    {isSellerModeOn ? "Switch to Buying" : "Switch to Selling"}
                  </button>

                  {isSellerModeOn ? (
                    <>
                      <NavLink to="/seller-dashboard" className={linkClass}>Dashboard</NavLink>
                      <NavLink to="/earnings" className={linkClass}>Earnings</NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink to="/seller-dashboard" className={linkClass}>Seller Dashboard</NavLink>
                      <NavLink to="/manage-orders" className={linkClass}>Orders</NavLink>
                    </>
                  )}
                </>
              )}

              <NavLink to="/messages" className={linkClass}>Messages</NavLink>
              <NavLink to="/profile" className={linkClass}>Profile</NavLink>

              {isSellerModeOn ? (
                <NavLink to="/create-gig" className="primary-cta">Create a Gig</NavLink>
              ) : null}

              <button onClick={handleLogout} className="nav-logout">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <NavLink to="/signup" className="primary-cta">Join</NavLink>
            </>
          )}
        </div>
      </nav>

      <div className="category-strip">
        {topCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => navigate(`/gigs?category=${encodeURIComponent(category)}`)}
          >
            {category}
          </button>
        ))}
      </div>
    </header>
  );
}

export default Navbar;
