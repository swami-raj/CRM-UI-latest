import  { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE } from "../../utils/api";
import { Save, RotateCcw, User, Mail, Phone, MapPin } from "lucide-react";

interface CompanyFormData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

const AddCompanyPage = () => {
  const [formData, setFormData] = useState<CompanyFormData>({
    id: 0,
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({ id: 0, name: "", email: "", phone: "", address: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(`${API_BASE}/company/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.code === 1 || response.data.code === 200) {
        toast.success(response.data.message || "Company added successfully!");
        resetForm();
      } else {
        toast.error(response.data.message || "Failed to add company");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Add Company</h1>
          <p className="text-gray-500 mt-1">
            Fill out the form to add a new company.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-md rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 mr-2 text-blue-600" /> Company Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter company name"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 mr-2 text-blue-600" /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 mr-2 text-blue-600" /> Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            {/* Address */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 mr-2 text-blue-600" /> Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter company address"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="flex items-center px-6 py-3 border rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <RotateCcw className="animate-spin w-4 h-4 mr-2" /> Adding...
                  </span>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Add Company
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCompanyPage;
