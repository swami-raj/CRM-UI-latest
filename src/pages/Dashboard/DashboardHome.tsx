import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import { User, Briefcase, Menu, Plus, Users, Building, Settings, Shield, TrendingUp, Clock, Activity, Eye, CheckCircle, XCircle, PlayCircle, PauseCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

interface DashboardHomeProps {
  onNavigateToTickets?: (status: string) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigateToTickets }) => {
  const navigate = useNavigate(); // Add this line
  const [userName, setUserName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [menuCount, setMenuCount] = useState(0);
  const [ticketStatusData, setTicketStatusData] = useState({
    COMPLETED: 0,
    CLOSED: 0,
    INPROGRESS: 0,
    PENDING: 0,
    OPEN: 0
  });
  const [loading, setLoading] = useState(false);

  // Define the display order for status cards
  const statusOrder = ['OPEN', 'PENDING', 'INPROGRESS', 'CLOSED', 'COMPLETED'];

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user?.name || "");
        setDepartmentName(user?.departmentName || "");
        setUserEmail(user?.email || "");
        setMenuCount(user?.menulist?.length || 0);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    
    fetchTicketStatusCounts();
  }, []);

  const fetchTicketStatusCounts = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.get("http://13.127.232.90:8081/ticket/ticket-status-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1) {
        setTicketStatusData(res.data.data);
      } else {
        toast.error(res.data.message || "Failed to fetch ticket status counts");
      }
    } catch (error) {
      console.error("Error fetching ticket status counts:", error);
      toast.error("Error fetching ticket status counts");
    } finally {
      setLoading(false);
    }
  };

  // Donut Chart Component
  const DonutChart = ({ data }: { data: Record<string, number> }) => {
    const total = Object.values(data).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
      return (
        <div className="flex items-center justify-center w-64 h-64">
          <div className="text-gray-500 text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-2"></div>
            <p>No tickets available</p>
          </div>
        </div>
      );
    }

    const colors: Record<string, string> = {
      COMPLETED: '#10b981', // Green
      CLOSED: '#6b7280',    // Gray
      INPROGRESS: '#f59e0b', // Amber
      PENDING: '#ef4444',   // Red
      OPEN: '#3b82f6'       // Blue
    };

    let currentAngle = 0;
    const radius = 80;
    const innerRadius = 50;
    const centerX = 120;
    const centerY = 120;

    const createPath = (startAngle: number, endAngle: number, outerRadius: number, innerRadius: number) => {
      const start = polarToCartesian(centerX, centerY, outerRadius, endAngle);
      const end = polarToCartesian(centerX, centerY, outerRadius, startAngle);
      const innerStart = polarToCartesian(centerX, centerY, innerRadius, endAngle);
      const innerEnd = polarToCartesian(centerX, centerY, innerRadius, startAngle);
      
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      
      return [
        "M", start.x, start.y, 
        "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
        "L", innerEnd.x, innerEnd.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
        "Z"
      ].join(" ");
    };

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
      const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    };

    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="240" height="240" className="drop-shadow-lg">
            {Object.entries(data).map(([status, count]) => {
              if (count === 0) return null;
              
              const percentage = (count / total) * 100;
              const angle = (count / total) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const path = createPath(startAngle, endAngle, radius, innerRadius);
              currentAngle += angle;
              
              return (
                <g key={status}>
                  <path
                    d={path}
                    fill={colors[status]}
                    className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                    onClick={() => handleCardClick(status)}
                  />
                </g>
              );
            })}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800">{total}</div>
              <div className="text-sm text-slate-600 font-medium">Total Tickets</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Updated handleCardClick function to navigate to ShowTicketPage with filter
  const handleCardClick = (status: string) => {
    // Navigate to ticket show page with status filter as URL parameter
    navigate(`/home/ticket/show?status=${status}`);
    
    // Also call the optional prop function if provided (for backward compatibility)
    if (onNavigateToTickets) {
      onNavigateToTickets(status);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-8 h-8 text-white" />;
      case 'CLOSED':
        return <XCircle className="w-8 h-8 text-white" />;
      case 'INPROGRESS':
        return <PlayCircle className="w-8 h-8 text-white" />;
      case 'PENDING':
        return <AlertCircle className="w-8 h-8 text-white" />;
      case 'OPEN':
        return <Activity className="w-8 h-8 text-white" />;
      default:
        return <Activity className="w-8 h-8 text-white" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'from-green-500 to-emerald-600';
      case 'CLOSED':
        return 'from-gray-500 to-gray-600';
      case 'INPROGRESS':
        return 'from-amber-500 to-orange-600';
      case 'PENDING':
        return 'from-red-500 to-red-600';
      case 'OPEN':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'CLOSED':
        return 'Closed';
      case 'INPROGRESS':
        return 'In Progress';
      case 'PENDING':
        return 'Pending';
      case 'OPEN':
        return 'Open';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Dynamic background with floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Hero Welcome Section with Donut Chart */}
      <div className="relative bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 overflow-hidden group">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 transform group-hover:scale-105 transition-transform duration-1000"></div>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center">
          {/* Donut Chart */}
          <div className="mb-8">
            {loading ? (
              <div className="flex items-center justify-center w-64 h-64 mx-auto">
                <div className="text-gray-500 text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse"></div>
                  <p>Loading ticket data...</p>
                </div>
              </div>
            ) : (
              <DonutChart data={ticketStatusData} />
            )}
          </div>
          
          <h2 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent mb-4 group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-500">
            Ticket Overview
          </h2>
          
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-200/50 mb-4">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold text-slate-700">
              {departmentName} Division
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>

         {/* Ticket Status Cards Grid - Now ordered according to statusOrder array */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statusOrder.map((status) => {
          const count = ticketStatusData[status as keyof typeof ticketStatusData];
          return (
            <div
              key={status}
              onClick={() => handleCardClick(status)}
              className="relative bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden cursor-pointer"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: `linear-gradient(135deg, ${status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.05)' : 
                  status === 'CLOSED' ? 'rgba(107, 114, 128, 0.05)' :
                  status === 'INPROGRESS' ? 'rgba(245, 158, 11, 0.05)' :
                  status === 'PENDING' ? 'rgba(239, 68, 68, 0.05)' :
                  'rgba(59, 130, 246, 0.05)'} to transparent)`
              }}></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-xl group-hover:opacity-20 transition-colors duration-500" style={{
                backgroundColor: status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' :
                  status === 'CLOSED' ? 'rgba(107, 114, 128, 0.1)' :
                  status === 'INPROGRESS' ? 'rgba(245, 158, 11, 0.1)' :
                  status === 'PENDING' ? 'rgba(239, 68, 68, 0.1)' :
                  'rgba(59, 130, 246, 0.1)'
              }}></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-r ${getStatusColor(status)} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {getStatusIcon(status)}
                  </div>
                  <div className="px-2 py-1 bg-white/70 text-gray-700 rounded-full text-xs font-semibold tracking-wide">
                    {loading ? '...' : count}
                  </div>
                </div>
                
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{getStatusLabel(status)}</h3>
                <p className="text-xl font-bold text-slate-800 mb-1">
                  {loading ? 'Loading...' : `${count} Tickets`}
                </p>
                <p className="text-slate-600 text-xs">Click to view details</p>
              </div>
            </div>
          );
        })}
      </div>
        </div>
      </div>

      
    </div>
  );
};

export default DashboardHome;