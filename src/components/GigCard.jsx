<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import "./GigCard.css";

function GigCard({ gig }) {
  const navigate = useNavigate();

  return (
    <div className="gig-card" onClick={() => navigate(`/gigs/${gig.id}`)}>
      <img src={gig.image} alt={gig.title} />

      <div className="gig-info">
        <h4>{gig.title}</h4>
        <p className="seller">by {gig.seller}</p>

        {/* ⭐ ADD THIS */}
        <div className="rating">
          ⭐ {gig.rating} <span>({gig.reviews} reviews)</span>
        </div>

        <p className="price">₹{gig.price}</p>
      </div>
    </div>
  );
}

export default GigCard;
=======
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import "./GigCard.css";

function GigCard({ gig }) {
  const navigate = useNavigate();

  return (
    <div className="gig-card" onClick={() => navigate(`/gig/${gig.id}`)}>
      <img src={gig.image} alt={gig.title} loading="lazy" />

      <div className="gig-info">
        <h4>{gig.title}</h4>
        <p className="seller">by {gig.sellerName || gig.seller || "Top Rated Seller"}</p>
        <p className="seller-meta">Level 2 Seller</p>

        <div className="rating">
          ⭐ {gig.rating} <span>({gig.reviews} reviews)</span>
        </div>

        <p className="price">₹{gig.price}</p>
      </div>
    </div>
  );
}

export default memo(GigCard);
>>>>>>> d2cf519 (Update project files)
