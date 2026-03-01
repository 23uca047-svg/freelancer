import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { gigsWithPrice } from "../data/gigsData";

function GigDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState("basic");

  // 🔐 Redirect to login if not authenticated
  if (!user) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2>Login Required</h2>
        <p>Please log in to view gig details and place orders.</p>
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

  const gigs = gigsWithPrice;

  const gig = gigs.find((g) => g.id === Number(id));

  if (!gig) {
    return <h2 style={{ padding: "40px" }}>Gig not found</h2>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h2>{gig.title}</h2>

      <img
        src={gig.image}
        alt={gig.title}
        style={{ width: "400px", borderRadius: "10px" }}
      />

      <p style={{ marginTop: "20px" }}>{gig.description}</p>

      <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
        {Object.keys(gig.packages).map((key) => {
          const pkg = gig.packages[key];

          return (
            <div
              key={key}
              onClick={() => setSelectedPackage(key)}
              style={{
                border:
                  selectedPackage === key
                    ? "2px solid #1dbf73"
                    : "1px solid #ccc",
                padding: "20px",
                width: "200px",
                cursor: "pointer",
                borderRadius: "8px",
              }}
            >
              <h3>{pkg.name}</h3>
              <h2>₹{pkg.price}</h2>
              <p>Delivery: {pkg.delivery}</p>
              <p>Revisions: {pkg.revisions}</p>
            </div>
          );
        })}
      </div>

      <button
        onClick={() =>
          navigate("/order", {
            state: {
              title: gig.title,
              selectedPackage: gig.packages[selectedPackage],
            },
          })
        }
        style={{
          marginTop: "30px",
          padding: "14px 24px",
          background: "#1dbf73",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          borderRadius: "6px",
        }}
      >
        Continue with {gig.packages[selectedPackage].name}
      </button>

      <button
        onClick={() => {
          alert("💬 Contact seller functionality: This would open a direct messaging interface with the seller.");
        }}
        style={{
          marginTop: "30px",
          marginLeft: "12px",
          padding: "14px 24px",
          background: "white",
          color: "#1dbf73",
          border: "2px solid #1dbf73",
          cursor: "pointer",
          fontSize: "16px",
          borderRadius: "6px",
          fontWeight: "600",
        }}
      >
        💬 Contact Seller
      </button>
    </div>
  );
}

export default GigDetails;