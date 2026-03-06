import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createGig } from "../services/gigService";
import "./CreateGig.css";

function CreateGig() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Graphics & Design");
  const [price, setPrice] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("3 days");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user || user.role !== "seller") {
      setError("Only sellers can create gigs.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createGig({
        user,
        title,
        description,
        category,
        price,
        deliveryTime,
        imageFile,
      });

      alert("Gig created successfully");
      navigate("/my-gigs");
    } catch (submitError) {
      console.error("Failed to create gig", submitError);
      setError(submitError.message || "Failed to create gig.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="create-gig-page">
      <h1>Create Gig</h1>
      <p>Only sellers can publish services to the marketplace.</p>

      {error ? <p className="create-gig-error">{error}</p> : null}

      <form className="create-gig-form" onSubmit={handleSubmit}>
        <label>
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label>
          <span>Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required />
        </label>

        <label>
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option>Graphics & Design</option>
            <option>Programming & Tech</option>
            <option>Digital Marketing</option>
            <option>Video & Animation</option>
            <option>Writing & Translation</option>
          </select>
        </label>

        <div className="create-gig-grid">
          <label>
            <span>Price (INR)</span>
            <input type="number" min="100" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </label>

          <label>
            <span>Delivery Time</span>
            <input value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} required />
          </label>
        </div>

        <label>
          <span>Image</span>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
        </label>

        <button type="submit" disabled={loading}>{loading ? "Creating..." : "Publish Gig"}</button>
      </form>
    </section>
  );
}

export default CreateGig;
