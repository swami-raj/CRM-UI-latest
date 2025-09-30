import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE } from "../../utils/api";
import { X } from "lucide-react";

interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
}

interface UserData {
  id?: number;
  departmentId: number;
  departmentName?: string;
  name: string;
  email?: string;
}

const ShowCompanyPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Check if user is SuperAdmin (departmentId === 1)
  const isSuperAdmin = userData?.departmentId === 1;

  // Helper function to get user ID from token
  const getUserIdFromToken = (): number | null => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return null;

      const cleanToken = token.replace('Bearer ', '');
      const payload = JSON.parse(atob(cleanToken.split('.')[1]));
      
      // Check different possible locations for user ID in the token
      if (payload.UserAuthDetails && payload.UserAuthDetails.id) {
        return payload.UserAuthDetails.id;
      }
      if (payload.id) {
        return payload.id;
      }
      if (payload.userId) {
        return payload.userId;
      }
      if (payload.sub) {
        return parseInt(payload.sub);
      }
      
      return null;
    } catch (error) {
      console.error("Error decoding token for user ID:", error);
      return null;
    }
  };

  // Fetch current user data
  const fetchUserData = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      // Get user ID from token
      const userId = getUserIdFromToken();
      if (!userId) {
        toast.error("Unable to get user ID from token");
        return;
      }

      console.log("Fetching user data for ID:", userId); // Debug log

      // Fetch current user data using the extracted user ID
      const res = await axios.get(`${API_BASE}/auth/getById/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data.code === 1 && res.data.data) {
        const user = {
          id: res.data.data.id,
          departmentId: res.data.data.departmentId,
          departmentName: res.data.data.departmentName,
          name: res.data.data.name,
          email: res.data.data.email
        };
        
        console.log("User data fetched:", user); // Debug log
        setUserData(user);
        
        // Store user data in sessionStorage for future use
        sessionStorage.setItem("userData", JSON.stringify(user));
      } else {
        toast.error("Failed to fetch user data");
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch user data");
    }
  };

  // Get user data on component mount
  useEffect(() => {
    const initializeUserData = async () => {
      // Try to get user data from sessionStorage first
      const storedUserData = sessionStorage.getItem("userData");
      if (storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          console.log("Using stored user data:", parsedUserData);
          setUserData(parsedUserData);
          return;
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          // Remove corrupted data
          sessionStorage.removeItem("userData");
        }
      }

      // If no valid stored user data, fetch from API
      await fetchUserData();
    };

    initializeUserData();
  }, []);

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
    
    if (!isSuperAdmin) {
      toast.error("You don't have permission to edit companies. Only SuperAdmin can edit.");
      return;
    }

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
    
    if (!isSuperAdmin) {
      toast.error("You don't have permission to delete companies. Only SuperAdmin can delete.");
      return;
    }

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

  const handleRefresh = () => {
    fetchCompanies();
    toast.success("Companies refreshed!");
  };

  // Function to handle edit button click with permission check
  const handleEditClick = (company: Company) => {
    if (!isSuperAdmin) {
      toast.error("You don't have permission to edit companies. Only SuperAdmin can edit.");
      return;
    }
    setSelectedCompany(company);
    setEditModal(true);
  };

  // Function to handle delete button click with permission check
  const handleDeleteClick = (company: Company) => {
    if (!isSuperAdmin) {
      toast.error("You don't have permission to delete companies. Only SuperAdmin can delete.");
      return;
    }
    setSelectedCompany(company);
    setDeleteModal(true);
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
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <i className="fas fa-sync-alt"></i> Refresh
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
                {/* Only show Actions column if user is SuperAdmin */}
                {isSuperAdmin && <th className="px-6 py-3 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 7 : 6} className="px-6 py-4 text-center text-gray-500">
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
                      {c.logo ? (
                        <img src={c.logo} alt="Logo" className="h-10 w-10 rounded" />
                      ) : (
                        <span className="text-gray-400">No Logo</span>
                      )}
                    </td>
                    {/* Only show Actions if user is SuperAdmin */}
                    {isSuperAdmin && (
                      <td className="px-6 py-4 flex justify-center space-x-3">
                        <button 
                          onClick={() => handleEditClick(c)} 
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit Company"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(c)} 
                          className="text-red-600 hover:text-red-800"
                          title="Delete Company"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    )}
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
              <input 
                type="text" 
                value={selectedCompany.name} 
                onChange={(e) => setSelectedCompany({ ...selectedCompany, name: e.target.value })} 
                className="w-full border p-2 rounded" 
                placeholder="Name" 
              />
              <input 
                type="email" 
                value={selectedCompany.email} 
                onChange={(e) => setSelectedCompany({ ...selectedCompany, email: e.target.value })} 
                className="w-full border p-2 rounded" 
                placeholder="Email" 
              />
              <input 
                type="text" 
                value={selectedCompany.phone} 
                onChange={(e) => setSelectedCompany({ ...selectedCompany, phone: e.target.value })} 
                className="w-full border p-2 rounded" 
                placeholder="Phone" 
              />
              <textarea 
                value={selectedCompany.address} 
                onChange={(e) => setSelectedCompany({ ...selectedCompany, address: e.target.value })} 
                className="w-full border p-2 rounded" 
                placeholder="Address" 
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button 
                onClick={() => setEditModal(false)} 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </Modal>
        )}

        {/* Delete Modal */}
        {deleteModal && selectedCompany && (
          <Modal title="Delete Company" onClose={() => setDeleteModal(false)}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Company</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedCompany.name}</span>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setDeleteModal(false)} 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
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
        <button onClick={onClose}>
          <X className="w-5 h-5 text-gray-600 hover:text-gray-800" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default ShowCompanyPage;