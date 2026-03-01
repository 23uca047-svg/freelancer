import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./Navbar.css";

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">freelance</Link>

      <div className="nav-links">
        <Link to="/gigs">Explore</Link>
        {user ? (
          <>
            <Link to="/my">My Account</Link>
            <Link to="/conversations">💬 Messages</Link>
            {user.role === "seller" && <Link to="/seller-orders">Manage Orders</Link>}
            <button onClick={handleLogout} className="nav-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Join</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
