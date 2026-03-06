import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getGigById } from "../services/gigService";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { formatRupees } from "../utils/currency";
import "./GigDetails.css";

function GigDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("basic");

  useEffect(() => {
    let mounted = true;

    getGigById(id)
      .then((result) => {
        if (!mounted) return;
        setGig(result);
        setError("");
      })
      .catch((fetchError) => {
        console.error("Failed to fetch gig details", fetchError);
        if (!mounted) return;
        setError("Unable to load gig details.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const packageOptions = useMemo(() => {
    if (!gig) return {};
    return gig.packages || {
      basic: {
        name: "Basic",
        price: gig.price,
        delivery: gig.deliveryTime || "3 days",
        revisions: "1",
      },
    };
  }, [gig]);

  if (loading) {
    return <LoadingState title="Loading gig" text="Preparing package details and seller info." />;
  }

  if (error) {
    return <ErrorState title="Gig unavailable" text={error} actionText="Back to gigs" onAction={() => navigate("/gigs")} />;
  }

  if (!gig) {
    return <ErrorState title="Gig not found" text="This gig may have been removed by the seller." actionText="Browse gigs" onAction={() => navigate("/gigs")} />;
  }

  const selectedPkg = packageOptions[selectedPackage] || Object.values(packageOptions)[0];
  const canOrder = Boolean(user && user.role === "buyer");

  return (
    <div className="gig-details-page">
      <h2>{gig.title}</h2>

      <img
        src={gig.image}
        alt={gig.title}
        loading="lazy"
      />

      <p>{gig.description}</p>

      <div className="seller-details-box">
        <h4>Seller Details</h4>
        <p><strong>Name:</strong> {gig.sellerName || "Top Rated Seller"}</p>
        <p><strong>Seller ID:</strong> {gig.sellerId || "N/A"}</p>
        <p><strong>Rating:</strong> {gig.rating || 0} ({gig.reviews || 0} reviews)</p>
      </div>

      <div className="packages-grid">
        {Object.keys(packageOptions).map((key) => {
          const pkg = packageOptions[key];

          return (
            <div
              key={key}
              onClick={() => setSelectedPackage(key)}
              className={`package-card ${selectedPackage === key ? "selected" : ""}`}
            >
              <h3>{pkg.name}</h3>
              <h2>{formatRupees(pkg.price)}</h2>
              <p>Delivery: {pkg.delivery}</p>
              <p>Revisions: {pkg.revisions}</p>
            </div>
          );
        })}
      </div>

      {canOrder ? (
        <button
          className="primary-action"
          onClick={() =>
            navigate("/order", {
              state: {
                gigId: gig.id,
                title: gig.title,
                sellerId: gig.sellerId,
                sellerName: gig.sellerName,
                selectedPackage: selectedPkg,
              },
            })
          }
        >
          Order Now - {selectedPkg.name}
        </button>
      ) : null}

      {!user ? (
        <button className="primary-action" onClick={() => navigate("/login")}>Login to order</button>
      ) : null}

      {user?.role === "seller" ? (
        <p className="seller-note">Seller accounts cannot place orders. Switch to a buyer account to order gigs.</p>
      ) : null}

      <button
        className="secondary-action"
        onClick={() => {
          alert("Contact seller functionality: This would open a direct messaging interface with the seller.");
        }}
      >
        Contact Seller
      </button>
    </div>
  );
}

export default GigDetails;
