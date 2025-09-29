import  { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE } from "../../utils/api";
import { UserPlus } from "lucide-react";

interface Company {
  id: number;
  name: string;
}
interface Department {
  id: number;
  name: string;
}
interface Role {
  id: number;
  name: string;
}
interface SubMenu {
  id: number;
  name: string;
}
interface Menu {
  id: number;
  name: string;
  submenulist?: SubMenu[];
}

const AddUserPage = () => {
  // form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // dropdown data
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);

  // selected values
  const [companyId, setCompanyId] = useState<number | "">("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [roleId, setRoleId] = useState<number | "">("");
  const [selectedMenus, setSelectedMenus] = useState<Record<number, number[]>>({});

  const [loading, setLoading] = useState(false);

  // fetch companies
  const fetchCompanies = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/company/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1 || res.data.code === 200) {
        setCompanies(res.data.data || []);
      }
    } catch {
      toast.error("Failed to fetch companies");
    }
  };

  // fetch departments
  const fetchDepartments = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/department/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1 || res.data.code === 200) {
        setDepartments(res.data.data || []);
      }
    } catch {
      toast.error("Failed to fetch departments");
    }
  };

  // fetch roles
  const fetchRoles = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/role/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1 || res.data.code === 200) {
        setRoles(res.data.data || []);
      }
    } catch {
      toast.error("Failed to fetch roles");
    }
  };

  // fetch menus
  const fetchMenus = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/menu/get-all-menus-with-submenus`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1 || res.data.code === 200) {
        setMenus(res.data.data || []);
      }
    } catch {
      toast.error("Failed to fetch menus");
    }
  };

  // fetch submenus dynamically
  const fetchSubMenus = async (menuId: number) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE}/sub-menu/get-subMenu-by-menu?menuId=${menuId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.code === 1 || res.data.code === 200) {
        setMenus((prev) =>
          prev.map((menu) =>
            menu.id === menuId ? { ...menu, submenulist: res.data.data } : menu
          )
        );
      }
    } catch {
      toast.error("Failed to fetch submenus");
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchDepartments();
    fetchRoles();
    fetchMenus();
  }, []);

  // handle menu + submenu selection
  const handleMenuToggle = (menuId: number) => {
    setSelectedMenus((prev) => {
      if (prev[menuId]) {
        const { [menuId]: _, ...rest } = prev;
        return rest;
      } else {
        const menu = menus.find((m) => m.id === menuId);
        if (menu && !menu.submenulist) {
          fetchSubMenus(menuId);
        }
        return { ...prev, [menuId]: [] };
      }
    });
  };

  const handleSubMenuToggle = (menuId: number, subMenuId: number) => {
    setSelectedMenus((prev) => {
      const existing = prev[menuId] || [];
      if (existing.includes(subMenuId)) {
        return { ...prev, [menuId]: existing.filter((id) => id !== subMenuId) };
      } else {
        return { ...prev, [menuId]: [...existing, subMenuId] };
      }
    });
  };

  const handleAddUser = async () => {
    if (!name || !email || !phone || !password || !companyId || !departmentId) {
      toast.error("Please fill all required fields");
      return;
    }

    const menuList = Object.entries(selectedMenus).map(([menuId, subMenuIds]) => ({
      id: Number(menuId),
      subMenuList: subMenuIds.map((id) => ({ id })),
    }));

    const body = {
      name,
      email,
      phone,
      password,
      departmentId,
      companyId,
      roleId,
      menuList,
    };

    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.post(`${API_BASE}/auth/signup`, body, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (res.data.code === 1 || res.data.code === 200) {
        toast.success("User added successfully!");
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setCompanyId("");
        setDepartmentId("");
        setRoleId("");
        setSelectedMenus({});
      } else {
        toast.error(res.data.message || "Failed to add user");
      }
    } catch {
      toast.error("Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-6">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 text-white shadow-md mb-3">
            <UserPlus className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Add New User</h1>
          <p className="text-gray-500 mt-1">
            Fill in the details to create a new user account.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-md rounded-xl p-6 space-y-5">
          {/* Inputs */}
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* Dropdowns */}
          <select
            value={companyId}
            onChange={(e) => setCompanyId(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select Company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={roleId}
            onChange={(e) => setRoleId(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select Role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Permissions Section */}
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Permissions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition"
              >
                <label className="flex items-center space-x-2 mb-2 font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedMenus[menu.id] !== undefined}
                    onChange={() => handleMenuToggle(menu.id)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span>{menu.name}</span>
                </label>

                {/* Submenus */}
                {menu.submenulist && selectedMenus[menu.id] !== undefined && (
                  <div className="pl-5 space-y-2 mt-2">
                    {menu.submenulist.map((sub) => (
                      <label
                        key={sub.id}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMenus[menu.id]?.includes(sub.id)}
                          onChange={() => handleSubMenuToggle(menu.id, sub.id)}
                          className="h-4 w-4 accent-blue-500"
                        />
                        <span>{sub.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleAddUser}
            disabled={loading}
            className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserPage;
