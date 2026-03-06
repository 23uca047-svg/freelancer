import { useMemo, useState } from "react";
import { Star } from "lucide-react";

function ReviewModal({ open, onClose, onSubmit, gigTitle }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      await onSubmit({ rating, comment });
      setComment("");
      setRating(5);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-xl font-bold text-slate-900">Leave a Review</h3>
        <p className="mt-1 text-sm text-slate-600">Share feedback for: {gigTitle || "Gig"}</p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Rating</p>
            <div className="flex items-center gap-2">
              {stars.map((star) => {
                const active = star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="rounded p-1"
                    aria-label={`Rate ${star}`}
                  >
                    <Star
                      size={24}
                      className={active ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Comment</span>
            <textarea
              rows={4}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="How was your experience?"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring"
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;
