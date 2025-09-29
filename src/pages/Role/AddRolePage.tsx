import  { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE } from "../../utils/api";
import { Plus, Save, RotateCcw, Shield } from "lucide-react";

const AddRolePage = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => setName("");

  const handleAddRole = async () => {
    if (!name.trim()) {
      toast.error("Please enter role name");
      return;
    }

    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      const body = { name };

      const response = await axios.post(`${API_BASE}/role/add`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.code === 200 || response.data.code === 1) {
        toast.success("Role added successfully!");
        resetForm();
      } else {
        toast.error(response.data.message || "Failed to add role");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 text-white shadow-md mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Add Role</h1>
          <p className="text-gray-500 mt-1">
            Create new roles and manage permissions for your team.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="space-y-5">
            {/* Role Name */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Save className="w-4 h-4 mr-2 text-blue-600" /> Role Name
              </label>
              <input
                type="text"
                placeholder="Enter role name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
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
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
              <button
                onClick={handleAddRole}
                disabled={loading}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? (
                  <span>Adding...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" /> Add Role
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRolePage;
