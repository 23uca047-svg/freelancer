import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createGig } from "../services/gigService";
import "./CreateGig.css";

const MAX_GIG_IMAGE_SIZE = 8 * 1024 * 1024;

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitState, setSubmitState] = useState("idle");
  const [error, setError] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setImageFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      setImageFile(null);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_GIG_IMAGE_SIZE) {
      setError("Image is too large. Max size is 8MB.");
      setImageFile(null);
      event.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user || user.role !== "seller") {
      setError("Only sellers can create gigs.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSubmitState(imageFile ? "uploading" : "publishing");
      setUploadProgress(0);

      await createGig({
        user,
        title,
        description,
        category,
        price,
        deliveryTime,
        imageFile,
        onUploadProgress: setUploadProgress,
      });

      setSubmitState("publishing");

      alert("Gig created successfully");
      navigate("/my-gigs");
    } catch (submitError) {
      console.error("Failed to create gig", submitError);
      const message = submitError?.message || "Failed to create gig. Please try again.";
      if (message.toLowerCase().includes("timed out") || message.toLowerCase().includes("stalled")) {
        setError("Image upload is taking too long. Try a smaller image (JPG/WEBP under 2MB) and publish again.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setSubmitState("idle");
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
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <small className="create-gig-help">Max image size: 8MB (images are optimized automatically for faster upload).</small>
        </label>

        <button type="submit" disabled={loading}>
          {loading
            ? submitState === "uploading"
              ? `Uploading image... ${uploadProgress}%`
              : "Publishing gig..."
            : "Publish Gig"}
        </button>
      </form>
    </section>
  );
}

export default CreateGig;
