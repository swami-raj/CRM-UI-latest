import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Activity, CheckCircle, XCircle, PlayCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import { API_BASE } from "../../utils/api";
import { toast } from "react-hot-toast";

interface DashboardHomeProps {
  onNavigateToTickets?: (status: string) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigateToTickets }) => {
  const navigate = useNavigate();
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
        console.log(userName, userEmail, menuCount)
      }
    }
    
    fetchTicketStatusCounts();
  }, []);

  const fetchTicketStatusCounts = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/ticket/ticket-status-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1) {
        console.log("Ticket Status Data:", res.data.data);
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

  // Updated handleCardClick function to navigate to ShowTicketPage with filter
  const handleCardClick = (status: string) => {
    navigate(`/home/ticket/show?status=${status}`);
    
    if (onNavigateToTickets) {
      onNavigateToTickets(status);
    }
  };

 
  
// Donut Chart Component - Fixed to show small segments
const DonutChart = ({ data }: { data: Record<string, number> }) => {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center w-64 h-64 mx-auto">
        <div className="text-gray-500 text-center">
          <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
            <Activity className="w-12 h-12 text-gray-400" />
          </div>
          <p className="font-medium">No tickets assigned yet</p>
          <p className="text-sm text-gray-400 mt-1">Tickets will appear here once assigned</p>
        </div>
      </div>
    );
  }

  const colors: Record<string, string> = {
    OPEN: '#3b82f6',
    PENDING: '#ef4444',
    INPROGRESS: '#f59e0b',
    CLOSED: '#6b7280',
    COMPLETED: '#10b981'
  };

  // Create segments for non-zero values, maintaining status order
  const statusOrder = ['OPEN', 'PENDING', 'INPROGRESS', 'CLOSED', 'COMPLETED'];
  const segments = statusOrder
    .filter(status => data[status] > 0)
    .map(status => ({
      status,
      count: data[status],
      percentage: (data[status] / total) * 100,
      color: colors[status]
    }));

  // SVG donut parameters - increased size for better visibility
  const size = 280;
  const strokeWidth = 35;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div className="flex items-center justify-center mx-auto">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          
          {/* Colored segments */}
          {segments.map((segment) => {
            // Ensure minimum visible size for very small segments
            const minVisiblePercentage = 0.5; // minimum 0.5% visibility
            const displayPercentage = Math.max(segment.percentage, minVisiblePercentage);
            const dashArray = (displayPercentage / 100) * circumference;
            const dashOffset = -accumulatedPercentage * circumference / 100;
            accumulatedPercentage += segment.percentage; // Use actual percentage for positioning

            return (
              <circle
                key={segment.status}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashArray} ${circumference}`}
                strokeDashoffset={dashOffset}
                className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                onClick={() => handleCardClick(segment.status)}
                style={{ 
                  strokeLinecap: 'butt', // Changed from 'round' to 'butt' for better small segment visibility
                  transition: 'all 0.3s ease'
                }}
              />
            );
          })}
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-800">{total}</div>
            <div className="text-sm text-slate-600 font-medium">Total Tickets</div>
          </div>
        </div>
      </div>
    </div>
  );
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
        <h2 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent mb-4 group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-500">
            Ticket Overview
          </h2>
        
          {/* Ticket Status Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pt-6">
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
          {/* Donut Chart */}
          <div className="mt-16">
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
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;