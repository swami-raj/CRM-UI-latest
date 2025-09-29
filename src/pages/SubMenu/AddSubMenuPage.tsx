import  { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE } from "../../utils/api";
import { Save, RotateCcw, Menu, AlertCircle } from "lucide-react";

interface SubMenuFormData {
  id: number;
  name: string;
  url: string;
  menuId: number;
}

interface MenuItem {
  id: number;
  name: string;
}

const AddSubMenuPage = () => {
  const [formData, setFormData] = useState<SubMenuFormData>({
    id: 0,
    name: "",
    url: "",
    menuId: 0,
  });
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch parent menus
  const fetchMenus = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/menu/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.code === 1) {
        setMenus(response.data.data || []);
      }
    } catch (err) {
      toast.error("Failed to load parent menus");
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "menuId" ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setFormData({ id: 0, name: "", url: "", menuId: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.menuId || !formData.name.trim() || !formData.url.trim()) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/sub-menu/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 1) {
        toast.success(response.data.message || "Submenu added successfully!");
        resetForm();
      } else {
        toast.error(response.data.message || "Failed to add submenu");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add submenu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Add Sub Menu</h1>
          <p className="text-gray-500 mt-1">
            Select a parent menu and configure a new submenu item.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-md rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Parent Menu */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Menu className="w-4 h-4 mr-2 text-blue-600" /> Parent Menu
              </label>
              <select
                name="menuId"
                value={formData.menuId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value={0}>Select parent menu</option>
                {menus.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submenu Name */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Save className="w-4 h-4 mr-2 text-blue-600" /> Submenu Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter submenu name"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Submenu URL */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <AlertCircle className="w-4 h-4 mr-2 text-blue-600" /> Submenu URL
              </label>
              <input
                type="text"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="e.g., add-user"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <AlertCircle className="w-4 h-4 mr-1 text-gray-400" />
                Use lowercase with hyphens for SEO-friendly URLs.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="flex items-center px-6 py-3 border rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? (
                  <span>Creating...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Create Submenu
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

export default AddSubMenuPage;
