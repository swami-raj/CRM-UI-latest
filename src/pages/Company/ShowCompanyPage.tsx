import  { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE } from "../../utils/api";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
}

const ShowCompanyPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/company/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1) setCompanies(res.data.data || []);
      else toast.error(res.data.message || "Failed to fetch companies");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleUpdate = async () => {
    if (!selectedCompany) return;
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE}/company/update`,
        selectedCompany,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data.code === 1) {
        toast.success("Company updated successfully!");
        setEditModal(false);
        fetchCompanies();
      } else toast.error(res.data.message || "Failed to update company");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update company");
    }
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.delete(`${API_BASE}/company/delete/${selectedCompany.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1) {
        toast.success("Company deleted successfully!");
        setCompanies((prev) => prev.filter((c) => c.id !== selectedCompany.id));
      } else toast.error(res.data.message || "Failed to delete company");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete company");
    } finally {
      setDeleteModal(false);
      setSelectedCompany(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading companies...</span>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">All Companies</h1>
            <p className="text-gray-600">Manage and view all companies</p>
          </div>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Search company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded-lg flex-1"
            />
            <button
              onClick={() => navigate("/home/company/add")}
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
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Address</th>
                <th className="px-6 py-3 text-left">Logo</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No companies found
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-gray-50 text-center">
                    <td className="px-6 py-4">{idx + 1}</td>
                    <td className="px-6 py-4">{c.name}</td>
                    <td className="px-6 py-4">{c.email}</td>
                    <td className="px-6 py-4">{c.phone}</td>
                    <td className="px-6 py-4">{c.address}</td>
                    <td className="px-6 py-4">
                      {c.logo ? <img src={c.logo} alt="Logo" className="h-10 w-10 rounded" /> : <span className="text-gray-400">No Logo</span>}
                    </td>
                    <td className="px-6 py-4 flex justify-center space-x-3">
                      <button onClick={() => { setSelectedCompany(c); setEditModal(true); }} className="text-blue-600 hover:text-blue-800">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => { setSelectedCompany(c); setDeleteModal(true); }} className="text-red-600 hover:text-red-800">
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
        {editModal && selectedCompany && (
          <Modal title="Edit Company" onClose={() => setEditModal(false)}>
            <div className="space-y-4">
              <input type="text" value={selectedCompany.name} onChange={(e) => setSelectedCompany({ ...selectedCompany, name: e.target.value })} className="w-full border p-2 rounded" placeholder="Name" />
              <input type="email" value={selectedCompany.email} onChange={(e) => setSelectedCompany({ ...selectedCompany, email: e.target.value })} className="w-full border p-2 rounded" placeholder="Email" />
              <input type="text" value={selectedCompany.phone} onChange={(e) => setSelectedCompany({ ...selectedCompany, phone: e.target.value })} className="w-full border p-2 rounded" placeholder="Phone" />
              <textarea value={selectedCompany.address} onChange={(e) => setSelectedCompany({ ...selectedCompany, address: e.target.value })} className="w-full border p-2 rounded" placeholder="Address" />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => setEditModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Update</button>
            </div>
          </Modal>
        )}

        {/* Delete Modal */}
        {deleteModal && selectedCompany && (
          <Modal title="Delete Company" onClose={() => setDeleteModal(false)}>
            <p>Are you sure you want to delete <b>{selectedCompany.name}</b>?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => setDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

// Reusable Modal
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

export default ShowCompanyPage;
