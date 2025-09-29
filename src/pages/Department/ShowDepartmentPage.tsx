import  { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE } from "../../utils/api";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Department {
  id: number;
  name: string;
  companyName: string;
}

const ShowDepartmentPage = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/department/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 200 || res.data.code === 1) setDepartments(res.data.data || []);
      else toast.error(res.data.message || "Failed to fetch departments");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedDepartment) return;
    try {
      const token = sessionStorage.getItem("token");
      const body = { id: selectedDepartment.id, name: selectedDepartment.name };
      const res = await axios.put(`${API_BASE}/department/update`, body, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.data.code === 200 || res.data.code === 1) {
        toast.success("Department updated successfully!");
        fetchDepartments();
        setEditModal(false);
      } else toast.error(res.data.message || "Failed to update department");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update department");
    }
  };

  const confirmDelete = async () => {
    if (!selectedDepartment) return;
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.delete(`${API_BASE}/department/delete/${selectedDepartment.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 200 || res.data.code === 1) {
        toast.success("Department deleted successfully!");
        setDepartments((prev) => prev.filter((d) => d.id !== selectedDepartment.id));
      } else toast.error(res.data.message || "Failed to delete department");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete department");
    } finally {
      setDeleteModal(false);
      setSelectedDepartment(null);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const filteredDepartments = departments.filter(
    (d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.companyName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading departments...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Departments</h1>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => navigate("/home/department/add")}
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
              {filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No departments found</td>
                </tr>
              ) : (
                filteredDepartments.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">{idx + 1}</td>
                    <td className="px-6 py-4">{d.name}</td>
                    <td className="px-6 py-4">{d.companyName}</td>
                    <td className="px-6 py-4 flex space-x-3">
                      <button onClick={() => { setSelectedDepartment(d); setEditModal(true); }} className="text-blue-600 hover:text-blue-900">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => { setSelectedDepartment(d); setDeleteModal(true); }} className="text-red-600 hover:text-red-900">
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
        {editModal && selectedDepartment && (
          <Modal title="Edit Department" onClose={() => setEditModal(false)}>
            <input
              type="text"
              value={selectedDepartment.name}
              onChange={(e) => setSelectedDepartment({ ...selectedDepartment, name: e.target.value })}
              className="w-full border rounded p-2 mb-4"
              placeholder="Department Name"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setEditModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Update</button>
            </div>
          </Modal>
        )}

        {/* Delete Modal */}
        {deleteModal && selectedDepartment && (
          <Modal title="Delete Department" onClose={() => setDeleteModal(false)}>
            <p className="mb-4">Are you sure you want to delete <b>{selectedDepartment.name}</b>?</p>
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

export default ShowDepartmentPage;