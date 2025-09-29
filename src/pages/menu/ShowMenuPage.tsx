import  { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { api, API_BASE } from "../../utils/api";

interface Menu {
  id: number;
  name: string;
  url: string;
  image: string; // Font Awesome class like "fas fa-home"
  isActive: boolean | null;
  submenulist?: any[];
}

interface ApiResponse {
  code: number;
  message: string;
  data: Menu[];
}

const ShowMenuPage = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await api.get<ApiResponse>("/menu/get-all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.code === 1) {
        setMenus(response.data.data || []);
        setFilteredMenus(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to fetch menus");
        setMenus([]);
        setFilteredMenus([]);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to fetch menus");
      setMenus([]);
      setFilteredMenus([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm) setFilteredMenus(menus);
    else
      setFilteredMenus(
        menus.filter(
          (menu) =>
            menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            menu.url.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
  }, [searchTerm, menus]);

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleRefresh = () => {
    fetchMenus();
    toast.success("Menus refreshed!");
  };

  const handleView = async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get<{ code: number; message: string; data: Menu }>(
        `${API_BASE}/menu/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.code === 1) {
        setSelectedMenu(res.data.data);
        setShowModal(true);
      } else toast.error(res.data.message || "Failed to fetch menu details");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to fetch menu details");
    }
  };

  const handleUpdate = async () => {
    if (!selectedMenu) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${API_BASE}/menu/edit/${selectedMenu.id}`, selectedMenu, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Menu updated successfully!");
      setShowModal(false);
      fetchMenus();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update menu");
    }
  };

  const handleDelete = (menuId: number) => {
    // Implement your delete logic here
    toast.success(`Menu ${menuId} deleted (demo)`); 
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading menus...</span>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Heading + Search + Refresh */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Menus List</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search menus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="overflow-x-auto bg-white shadow rounded-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Menu Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">URL Path</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Icon</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredMenus.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No menus found
                </td>
              </tr>
            ) : (
              filteredMenus.map((menu) => (
                <tr key={menu.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{menu.id}</td>
                  <td className="px-6 py-4">{menu.name}</td>
                  <td className="px-6 py-4">{menu.url}</td>
                  <td className="px-6 py-4">
                    <i className={`${menu.image} text-gray-600 text-lg`}></i>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleView(menu.id)}
                      className="text-blue-600 hover:text-blue-900 transition"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(menu.id)}
                      className="text-red-600 hover:text-red-900 transition"
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
      {showModal && selectedMenu && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Edit Menu</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Menu Name</label>
                <input
                  type="text"
                  value={selectedMenu.name}
                  onChange={(e) =>
                    setSelectedMenu({ ...selectedMenu, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">URL Path</label>
                <input
                  type="text"
                  value={selectedMenu.url}
                  onChange={(e) => setSelectedMenu({ ...selectedMenu, url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Icon Class (Font Awesome)</label>
                <input
                  type="text"
                  value={selectedMenu.image}
                  onChange={(e) =>
                    setSelectedMenu({ ...selectedMenu, image: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. fas fa-home"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <i className="fas fa-eye"></i> Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowMenuPage;
