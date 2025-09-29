import  { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE } from "../../utils/api";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Role {
  id: number;
  name: string;
  companyName: string;
}

const ShowRolePage = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/role/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 200) setRoles(res.data.data || []);
      else toast.error(res.data.message || "Failed to fetch roles");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedRole) return;
    try {
      const token = sessionStorage.getItem("token");
      const body = { id: selectedRole.id, name: selectedRole.name };
      const res = await axios.put(`${API_BASE}/role/update`, body, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.data.code === 200) {
        toast.success("Role updated successfully!");
        fetchRoles();
        setEditModal(false);
      } else toast.error(res.data.message || "Failed to update role");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update role");
    }
  };

  const confirmDelete = async () => {
    if (!selectedRole) return;
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.delete(`${API_BASE}/role/delete/${selectedRole.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 200) {
        toast.success("Role deleted successfully!");
        setRoles((prev) => prev.filter((r) => r.id !== selectedRole.id));
      } else toast.error(res.data.message || "Failed to delete role");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete role");
    } finally {
      setDeleteModal(false);
      setSelectedRole(null);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.companyName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading roles...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">All Roles</h1>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
             <button
              onClick={() => navigate("/home/role/add")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <i className="fas fa-plus mr-2"></i> Add
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No roles found</td>
                </tr>
              ) : (
                filteredRoles.map((role, idx) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">{idx + 1}</td>
                    <td className="px-6 py-4">{role.name}</td>
                    <td className="px-6 py-4">{role.companyName}</td>
                    <td className="px-6 py-4 flex space-x-3">
                      <button
                        onClick={() => { setSelectedRole(role); setEditModal(true); }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => { setSelectedRole(role); setDeleteModal(true); }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editModal && selectedRole && (
          <Modal title="Edit Role" onClose={() => setEditModal(false)}>
            <input
              type="text"
              value={selectedRole.name}
              onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
              className="w-full border rounded p-2 mb-4"
              placeholder="Role Name"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setEditModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Update</button>
            </div>
          </Modal>
        )}

        {/* Delete Modal */}
        {deleteModal && selectedRole && (
          <Modal title="Delete Role" onClose={() => setDeleteModal(false)}>
            <p className="mb-4">Are you sure you want to delete <b>{selectedRole.name}</b>?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

// Reusable Modal Component
const Modal = ({ title, children, onClose }: any) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <button onClick={onClose}><X className="w-5 h-5 text-gray-600 hover:text-gray-800" /></button>
      </div>
      {children}
    </div>
  </div>
);

export default ShowRolePage;
