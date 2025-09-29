import  { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE } from "../../utils/api";

interface MenuFormData {
  name: string;
  url: string;
  image: string;
}

const AddMenuPage = () => {
  const [formData, setFormData] = useState<MenuFormData>({
    name: "",
    url: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);

  const iconOptions = [
    { value: "fas fa-bars", label: "Bars (≡)" },
    { value: "fas fa-home", label: "Home (🏠)" },
    { value: "fas fa-user", label: "User (👤)" },
    { value: "fas fa-users", label: "Users (👥)" },
    { value: "fas fa-cog", label: "Settings (⚙️)" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({ name: "", url: "", image: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim() || !formData.image.trim()) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/menu/add`,
        {
          id: 0,
          ...formData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 1) {
        toast.success(response.data.message || "Menu added successfully!");
        resetForm();
      } else {
        toast.error(response.data.message || "Failed to add menu");
      }
    } catch (error: any) {
      console.error("Add menu failed:", error);
      toast.error(error?.response?.data?.message || "Failed to add menu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Add New Menu</h1>
          <p className="text-gray-500 mt-1">
            Create a new menu item for your system
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menu Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter menu name"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menu URL *
              </label>
              <input
                type="text"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="e.g., user-management"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use lowercase with hyphens
              </p>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menu Icon *
              </label>
              <select
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="">Select an icon</option>
                {iconOptions.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-5 py-2 border rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Menu"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMenuPage;
