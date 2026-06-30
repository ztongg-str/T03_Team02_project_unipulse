import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventsAPI } from "../../services/api";
import LocationPicker from "../LocationPicker";

const categories = [
  "workshop", "festival", "sports", "academic",
  "social", "cultural", "networking", "other",
];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    maxParticipants: "",
    image: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim() || form.title.trim().length < 3)
      errs.title = "Title must be at least 3 characters";
    if (!form.description.trim() || form.description.trim().length < 10)
      errs.description = "Description must be at least 10 characters";
    if (!form.date) errs.date = "Date is required";
    if (!form.location.trim()) errs.location = "Location is required";
    if (!form.category) errs.category = "Category is required";
    if (!form.maxParticipants || Number(form.maxParticipants) < 1)
      errs.maxParticipants = "Must allow at least 1 participant";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        maxParticipants: Number(form.maxParticipants),
      };
      if (!payload.image) delete payload.image;
      await eventsAPI.create(payload);
      navigate("/organizer/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create event. Please try again.";
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border ${
      errors[field]
        ? "border-red-400 bg-red-50"
        : "border-gray-200 bg-white"
    } text-sm text-gray-800 placeholder-gray-400 transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="org-section-card">
        <div className="org-section-header">
          <h2 className="org-section-title">Create New Event</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          {serverError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter event title"
              className={inputClass("title")}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your event"
              rows={4}
              className={`${inputClass("description")} resize-none`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Date
              </label>
              <input
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
                className={inputClass("date")}
              />
              {errors.date && (
                <p className="mt-1 text-xs text-red-500">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClass("category")}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-500">{errors.category}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <LocationPicker
                value={form.location}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, location: val }))
                }
                error={errors.location}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Max Participants
              </label>
              <input
                type="number"
                name="maxParticipants"
                value={form.maxParticipants}
                onChange={handleChange}
                placeholder="e.g. 100"
                min="1"
                className={inputClass("maxParticipants")}
              />
              {errors.maxParticipants && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.maxParticipants}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Image URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={inputClass("image")}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? "Creating..." : "Create Event"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/organizer/dashboard")}
              className="btn btn-outlined"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
