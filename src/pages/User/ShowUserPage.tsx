import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE } from "../../utils/api";
import { X } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  departmentId: number;
  departmentName: string | null;
  roleId: number | null;
  roleName: string | null;
  companyId: number;
  companyName: string | null;
}

interface UserData {
  id?: number;
  departmentId: number;
  departmentName?: string;
  name: string;
  email?: string;
}

const ShowUserPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Check if current user is Super Admin (departmentId === 1)
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/auth/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1 || res.data.code === 200) setUsers(res.data.data || []);
      else toast.error(res.data.message || "Failed to fetch users");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const viewUser = async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/auth/getById/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1) {
        setSelectedUser(res.data.data);
        setViewModal(true);
      } else toast.error(res.data.message || "Failed to fetch user details");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch user details");
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.delete(`${API_BASE}/auth/deleteById/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1) {
        toast.success("User deleted successfully!");
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        setDeleteModal(false);
        setSelectedUser(null);
      } else toast.error(res.data.message || "Failed to delete user");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">All Users</h1>
            <p className="text-gray-600">Manage and view all registered users</p>
          </div>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={fetchUsers}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-medium"
            >
              <i className="fas fa-sync-alt mr-2"></i> Refresh
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                {isSuperAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 8 : 7} className="px-6 py-12 text-center text-gray-500">
                    <i className="fas fa-users text-4xl mb-4 text-gray-300"></i>
                    <p className="text-lg">No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">{idx + 1}</td>
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className="h-10 w-10 flex-shrink-0 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.phone}</td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4 text-sm text-gray-900">{user.companyName || `ID: ${user.companyId}`}</td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-900">{user.departmentName || `ID: ${user.departmentId}`}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.roleName || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-right flex space-x-3 justify-end">
                      <button onClick={() => viewUser(user.id)} className="text-blue-600 hover:text-blue-900">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button onClick={() => { setSelectedUser(user); setDeleteModal(true); }} className="text-red-600 hover:text-red-900">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* View Modal */}
        {viewModal && selectedUser && (
          <Modal title={selectedUser.name} onClose={() => setViewModal(false)}>
            <div className="space-y-3">
              <p><span className="font-semibold">Email:</span> {selectedUser.email}</p>
              <p><span className="font-semibold">Phone:</span> {selectedUser.phone}</p>
              {isSuperAdmin && (
                <p><span className="font-semibold">Company:</span> {selectedUser.companyName || `ID: ${selectedUser.companyId}`}</p>
              )}
              <p><span className="font-semibold">Department:</span> {selectedUser.departmentName || `ID: ${selectedUser.departmentId}`}</p>
              <p><span className="font-semibold">Role:</span> {selectedUser.roleName || "N/A"}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setViewModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
            </div>
          </Modal>
        )}

        {/* Delete Modal */}
        {deleteModal && selectedUser && (
          <Modal title="Delete User" onClose={() => setDeleteModal(false)}>
            <p>Are you sure you want to delete <b>{selectedUser.name}</b>?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => setDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={deleteUser} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
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

export default ShowUserPage;