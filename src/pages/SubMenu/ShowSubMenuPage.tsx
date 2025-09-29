import  { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE } from "../../utils/api";

interface SubMenu {
  id: number;
  name: string;
  url: string;
  isActive: string;
  menuId: number;
}

interface Menu {
  id: number;
  name: string;
}

const ShowSubMenuPage = () => {
  const [submenus, setSubmenus] = useState<SubMenu[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredSubmenus, setFilteredSubmenus] = useState<SubMenu[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubMenu, setSelectedSubMenu] = useState<SubMenu | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch menus
  const fetchMenus = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/menu/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.code === 1) setMenus(response.data.data || []);
    } catch (error) {
      console.error("Fetch menus failed:", error);
    }
  };

  // Fetch submenus
  const fetchSubmenus = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/sub-menu/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.code === 1) {
        setSubmenus(response.data.data || []);
        setFilteredSubmenus(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to fetch submenus");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch submenus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchSubmenus();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredSubmenus(submenus);
    } else {
      const filtered = submenus.filter(
        (submenu) =>
          submenu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submenu.url.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSubmenus(filtered);
    }
  }, [searchTerm, submenus]);

  const getMenuName = (menuId: number) => {
    const menu = menus.find((m) => m.id === menuId);
    return menu ? menu.name : `ID: ${menuId}`;
  };

  const handleView = async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/sub-menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.code === 1) {
        setSelectedSubMenu(response.data.data);
        setShowEditModal(true);
      } else {
        toast.error(response.data.message || "Failed to fetch submenu details");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch submenu details");
    }
  };

  const handleUpdate = async () => {
    if (!selectedSubMenu) return;

    try {
      const token = sessionStorage.getItem("token");
      const body = {
        id: selectedSubMenu.id,
        name: selectedSubMenu.name,
        url: selectedSubMenu.url,
        menuId: selectedSubMenu.menuId,
      };

      const response = await axios.put(
        `${API_BASE}/sub-menu/edit/${selectedSubMenu.id}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 1) {
        toast.success("Submenu updated successfully!");
        fetchSubmenus();
        setShowEditModal(false);
      } else {
        toast.error(response.data.message || "Failed to update submenu");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update submenu");
    }
  };

  const confirmDelete = async () => {
    if (!selectedSubMenu) return;

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(
        `${API_BASE}/sub-menu/${selectedSubMenu.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.code === 1) {
        toast.success("Submenu deleted successfully!");
        fetchSubmenus();
      } else {
        toast.error(response.data.message || "Failed to delete submenu");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete submenu");
    } finally {
      setShowDeleteModal(false);
      setSelectedSubMenu(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading submenus...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-4xl font-bold text-slate-800">Submenu List</h1>
        <div className="flex gap-3 items-center">
          {/* Search */}
          <div className="relative flex items-center border rounded-xl px-3 py-2">
            <i className="fas fa-search text-slate-500 mr-2"></i>
            <input
              type="text"
              placeholder="Search submenus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outline-none bg-transparent text-slate-700"
            />
          </div>
          {/* Refresh */}
          <button
            onClick={() => { fetchSubmenus(); toast.success("Submenus refreshed!"); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {/* Submenus Table */}
      <div className="overflow-x-auto bg-white shadow rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                <i ></i> ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                <i className="fas fa-layer-group mr-1"></i> Parent Menu
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">URL</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Active</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSubmenus.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No submenus found
                </td>
              </tr>
            ) : (
              filteredSubmenus.map((submenu) => (
                <tr key={submenu.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{submenu.id}</td>
                  <td className="px-6 py-4">{getMenuName(submenu.menuId)}</td>
                  <td className="px-6 py-4">{submenu.name}</td>
                  <td className="px-6 py-4">{submenu.url}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${submenu.isActive === "true" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {submenu.isActive === "true" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleView(submenu.id)} className="text-blue-600 hover:text-blue-900 transition">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => { setSelectedSubMenu(submenu); setShowDeleteModal(true); }} className="text-red-600 hover:text-red-900 transition">
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
      {showEditModal && selectedSubMenu && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Edit Submenu</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={selectedSubMenu.name}
                onChange={(e) => setSelectedSubMenu({ ...selectedSubMenu, name: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                placeholder="Name"
              />
              <input
                type="text"
                value={selectedSubMenu.url}
                onChange={(e) => setSelectedSubMenu({ ...selectedSubMenu, url: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                placeholder="URL"
              />
              <select
                value={selectedSubMenu.menuId}
                onChange={(e) => setSelectedSubMenu({ ...selectedSubMenu, menuId: Number(e.target.value) })}
                className="w-full border px-3 py-2 rounded"
              >
                {menus.map((menu) => (
                  <option key={menu.id} value={menu.id}>{menu.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                <i className="fas fa-eye"></i> Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedSubMenu && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <h2 className="text-lg font-bold mb-3">Delete Submenu</h2>
            <p className="mb-4">Are you sure you want to delete <strong>{selectedSubMenu.name}</strong>?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowSubMenuPage;
