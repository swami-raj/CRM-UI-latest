import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link } from "react-router-dom";
import { ChevronDown, Menu, X, User, LogOut, Shield, Bell } from "lucide-react";

interface SubMenu {
  id: number;
  name: string;
  url: string;
  menuId: number;
  isActive?: boolean;
}

interface Menu {
  id: number;
  name: string;
  url: string;
  image: string;
  isActive?: boolean;
  color: string;
  submenulist: SubMenu[];
}

const Dashboard = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [userName, setUserName] = useState("");

  const [departmentName, setDepartmentName] = useState("");
  const [expandedMenus, setExpandedMenus] = useState<{ [key: number]: boolean }>({});
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) {
      console.log("No user data found, redirecting to login");
      navigate("/");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setMenus(user?.menulist || []);
      setUserName(user?.name || "");
      
      setDepartmentName(user?.departmentName || "");
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/");
    }
  }, [navigate]);

  const handleMenuClick = (menu: Menu) => {
    if (menu.submenulist && menu.submenulist.length > 0) {
      setExpandedMenus((prev) => ({
        ...prev,
        [menu.id]: !prev[menu.id],
      }));
    } else {
      navigate(`/home/${menu.url}`);
    }
  };

  const handleSubmenuClick = (menuUrl: string, subUrl: string) => {
    navigate(`/home/${menuUrl}/${subUrl}`);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex relative overflow-hidden">
      {/* Dynamic background with floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e40af" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Sidebar - Reduced width from w-80 to w-64 */}
      <div
        className={`${
          collapsed ? "w-16" : "w-64"
        } fixed top-0 left-0 h-screen 
        bg-gradient-to-b from-blue-800 via-blue-700 to-blue-900 
        text-white shadow-2xl flex flex-col transition-all duration-500 z-20`}
      >

        {/* Logo + Collapse */}
        <div className="flex items-center justify-between p-4 border-b border-blue-600/50">
          {!collapsed && (
            <Link to="/home" className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-xl blur-lg opacity-50"></div>
                <div className="relative w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-base font-bold tracking-wide">Radiance Solution</h1>
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-blue-600/30 transition"
          >
            {collapsed ? (
              <Menu className="w-5 h-5 text-white" />
            ) : (
              <X className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-transparent">
          {menus.map((menu) => {
            const isExpanded = expandedMenus[menu.id];
            return (
              <div key={menu.id} className="group">
                <button
                  onClick={() => handleMenuClick(menu)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition relative overflow-hidden ${
                    isExpanded
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg"
                      : "hover:bg-blue-700/40"
                  }`}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-blue-400 to-blue-600 blur-xl transition"></div>

                  <div className="relative flex items-center space-x-2.5">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-900/60 rounded-lg shadow-inner">
                      <i
                        className={`${menu.image} text-sm`}
                        style={{ color: isExpanded ? "#fff" : "#93c5fd" }}
                      />
                    </div>
                    {!collapsed && (
                      <span className="font-semibold tracking-wide text-sm">{menu.name}</span>
                    )}
                  </div>

                  {!collapsed && menu.submenulist?.length > 0 && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? "rotate-180 text-white" : "text-blue-300"
                      }`}
                    />
                  )}
                </button>

                {/* Submenus */}
                {!collapsed && menu.submenulist?.length > 0 && (
                  <div
                    className={`ml-5 mt-2 space-y-1 border-l border-blue-700/50 pl-3 transition-all duration-500 ease-in-out ${
                      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    {menu.submenulist.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleSubmenuClick(menu.url, sub.url)}
                        className="block w-full text-left px-2.5 py-2 text-sm rounded-lg text-blue-200 hover:bg-blue-700/40 hover:text-white transition"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Main content - Adjusted margin from 20rem to 16rem and 5rem to 4rem */}
      <div
        className="flex-1 flex flex-col relative transition-all duration-500"
        style={{ marginLeft: collapsed ? "4rem" : "16rem" }}
      >

        {/* Enhanced Header */}
        <header className="relative bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-xl border-b border-white/20 shadow-xl overflow-hidden">
          {/* Header background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-600/5 to-blue-600/5"></div>
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex justify-between items-center px-8 py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
             

              {/* User Info Card */}
              <div className="flex items-center space-x-3 px-4 py-2.5 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group/userinfo">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{userName}</p>
                  <p className="text-xs text-slate-500">{departmentName}</p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-blue-500 rounded-full blur-lg opacity-30 group-hover/userinfo:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-r from-slate-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover/userinfo:scale-110 transition-transform duration-300">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Enhanced Logout Button */}
              <button
                onClick={handleLogout}
                className="relative px-5 py-2.5 bg-gradient-to-r from-slate-700 to-blue-700 text-white rounded-2xl shadow-xl hover:from-slate-800 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center space-x-2 group/logout overflow-hidden"
              >
                {/* Button background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/logout:opacity-100 transition-opacity duration-300"></div>
                <LogOut className="relative w-4 h-4 group-hover/logout:rotate-12 transition-transform duration-300" />
                <span className="relative font-semibold text-sm">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-6 relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;