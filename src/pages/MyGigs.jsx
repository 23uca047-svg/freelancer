import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EmptyState from "../components/common/EmptyState";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { removeGig, subscribeSellerGigs } from "../services/gigService";
import { formatRupees } from "../utils/currency";
import "./MyGigs.css";

function MyGigs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "seller") {
      navigate("/");
      return;
    }

    const unsubscribe = subscribeSellerGigs(
      user.uid,
      (list) => {
        setGigs(list);
        setError("");
        setLoading(false);
      },
      (snapshotError) => {
        console.error("Failed to fetch seller gigs", snapshotError);
        setError("Unable to load your gigs.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, navigate]);

  const handleDelete = async (gigId) => {
    const confirmed = window.confirm("Delete this gig?");
    if (!confirmed) return;

    try {
      await removeGig(gigId, user);
    } catch (deleteError) {
      console.error("Failed to delete gig", deleteError);
      alert(deleteError.message || "Failed to delete gig.");
    }
  };

  if (loading) {
    return <LoadingState title="Loading my gigs" text="Fetching gigs that belong to your seller account." />;
  }

  if (error) {
    return <ErrorState title="My gigs unavailable" text={error} />;
  }

  return (
    <section className="my-gigs-page">
      <header className="my-gigs-head">
        <h1>My Gigs</h1>
        <button type="button" onClick={() => navigate("/create-gig")}>Create Gig</button>
      </header>

      {gigs.length ? (
        <div className="my-gigs-grid">
          {gigs.map((gig) => (
            <article key={gig.id} className="my-gig-card">
              <img src={gig.image} alt={gig.title} loading="lazy" />
              <div>
                <h3>{gig.title}</h3>
                <p>{gig.category}</p>
              </div>
              <strong>{formatRupees(gig.price)}</strong>
              <div className="my-gig-actions">
                <button type="button" onClick={() => navigate(`/gig/${gig.id}`)}>View</button>
                <button type="button" className="danger" onClick={() => handleDelete(gig.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No gigs yet" text="Create your first gig to start receiving orders." />
      )}
    </section>
  );
}

export default MyGigs;
