import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE } from "../../utils/api";
import { X, ChevronLeft, ChevronRight, Download, RotateCcw } from "lucide-react";

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  experience: string;
  currentCTC: string;
  expectedCTC: string;
  noticePeriod: string;
  skills: string;
  resumeLink: string | null;
  status: string;
  linkedInProfile: string;
  notes: string;
}

interface UserData {
  id?: number;
  departmentId: number;
  departmentName?: string;
  name: string;
  email?: string;
}

const ShowCandidatePage = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [sendModal, setSendModal] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [callModal, setCallModal] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Reference for the scrollable table container
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Check if user has edit/delete permissions (Super Admin or Admin only)
  const hasEditDeletePermission = userData?.departmentId === 1 || userData?.departmentId === 2;
  
  // Check if user has admin permissions (Super Admin or Admin only) - for template download only
  const hasAdminPermission = userData?.departmentId === 1 || userData?.departmentId === 2;

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

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/candidates/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1) setCandidates(res.data.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  // Pagination calculations
  const totalEntries = filteredCandidates.length;
  const totalPages = entriesPerPage === -1 ? 1 : Math.ceil(totalEntries / entriesPerPage);
  
  // Get current page data
  const getCurrentPageData = () => {
    if (entriesPerPage === -1) {
      return filteredCandidates; // Show all entries
    }
    
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredCandidates.slice(startIndex, endIndex);
  };

  const currentData = getCurrentPageData();

  // Reset to first page when search changes or entries per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, entriesPerPage]);

  // Handle entries per page change
  const handleEntriesPerPageChange = (value: string) => {
    const numValue = value === "all" ? -1 : parseInt(value);
    setEntriesPerPage(numValue);
    setCurrentPage(1);
  };

  // Handle page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleView = async (id: number) => {
    const token = sessionStorage.getItem("token");
    const res = await axios.get(`${API_BASE}/candidates/get-by-id/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.data.code === 1) {
      setSelectedCandidate(res.data.data);
      setEditMode(false);
      setViewModal(true);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCandidate || !hasEditDeletePermission) {
      toast.error("You don't have permission to edit candidates");
      return;
    }
    
    // Basic validation
    if (!selectedCandidate.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!selectedCandidate.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!selectedCandidate.phone.trim()) {
      toast.error("Phone is required");
      return;
    }
    
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.put(`${API_BASE}/candidates/update`, selectedCandidate, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.data.code === 1) {
        toast.success("Candidate updated successfully!");
        setEditMode(false);
        setViewModal(false);
        fetchCandidates();
      } else {
        toast.error(res.data.message || "Failed to update candidate");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update candidate");
    }
  };

  const handleDelete = async () => {
    if (!selectedCandidate || !hasEditDeletePermission) {
      toast.error("You don't have permission to delete candidates");
      return;
    }
    
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.delete(`${API_BASE}/candidates/delete/${selectedCandidate.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1) {
        toast.success("Candidate deleted successfully");
        setDeleteModal(false);
        setViewModal(false);
        fetchCandidates();
      } else {
        toast.error(res.data.message || "Failed to delete candidate");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete candidate");
    }
  };

  const handleSendCandidateDetail = async (email: string, candidateId: number) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/ticket/send-candidate-detail?email=${encodeURIComponent(email)}&candidateId=${candidateId}`,
        { email, candidateId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.code === 1) toast.success(res.data.message);
      else toast.error(res.data.message || "Failed to send candidate details");
    } catch {
      toast.error("Something went wrong while sending candidate details");
    }
  };

  // Download template handler with permission check
  const handleDownloadTemplate = async () => {
    if (!hasAdminPermission) {
      toast.error("You don't have permission to download template. Only Super Admin and Admin can download.");
      return;
    }

    setDownloadLoading(true);
    const token = sessionStorage.getItem("token");

    try {
      // Using the provided API endpoint for template download
      const response = await axios.get(`${API_BASE}/import/candidates/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob', // Important for downloading files
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Try to get filename from response headers, fallback to default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'candidate_data.csv';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Downloaded successfully!");
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error(error?.response?.data?.message || "Failed to download");
    } finally {
      setDownloadLoading(false);
    }
  };

  // Function to handle edit button click with permission check
  const handleEditClick = () => {
    if (!hasEditDeletePermission) {
      toast.error("You don't have permission to edit candidates. Only Super Admin and Admin can edit.");
      return;
    }
    setEditMode(true);
  };

  // Function to handle delete button click with permission check
  const handleDeleteClick = (candidate: Candidate) => {
    if (!hasEditDeletePermission) {
      toast.error("You don't have permission to delete candidates. Only Super Admin and Admin can delete.");
      return;
    }
    setSelectedCandidate(candidate);
    setDeleteModal(true);
  };

  // Scroll functions for the table
  const scrollLeft = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({
        left: -200, // Scroll by 200px (approximately 1-2 columns)
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({
        left: 200, // Scroll by 200px (approximately 1-2 columns)
        behavior: 'smooth'
      });
    }
  };

  // Tooltip Component
  const TooltipCell = ({ content, maxLength = 30 }: { content: string, maxLength?: number }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const displayText = content && content.length > maxLength ? content.substring(0, maxLength) + '...' : content || 'N/A';
    const shouldShowTooltip = content && content.length > maxLength;

    return (
      <div 
        className="relative"
        onMouseEnter={() => shouldShowTooltip && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="cursor-pointer">{displayText}</span>
        {showTooltip && (
          <div className="absolute z-10 p-2 bg-gray-800 text-white text-sm rounded shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 max-w-xs break-words">
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
    );
  };

  // Link Cell Component for LinkedIn and Resume
  const LinkCell = ({ url, text }: { url: string | null; text: string }) => {
    if (!url) return <span className="text-gray-400">N/A</span>;

    // Function to ensure URL has proper protocol
    const formatUrl = (inputUrl: string): string => {
      const trimmedUrl = inputUrl.trim();
      
      // If URL already has protocol, return as is
      if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        return trimmedUrl;
      }
      
      // If URL starts with www., add https://
      if (trimmedUrl.startsWith('www.')) {
        return `https://${trimmedUrl}`;
      }
      
      // For other cases, add https://
      return `https://${trimmedUrl}`;
    };

    const formattedUrl = formatUrl(url);
  
    return (
      <a
        href={formattedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
        onClick={(e) => e.stopPropagation()}
      >
        {text}
      </a>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading candidates...</span>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Candidates</h1>
        
        {/* Download Template - Only show if user has permission */}
        {hasAdminPermission && (
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={downloadLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadLoading ? (
              <>
                <RotateCcw className="animate-spin w-4 h-4 mr-2" /> Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" /> Download
              </>
            )}
          </button>
        )}
      </div>

      {/* Search & Refresh */}
      <div className="flex items-center mb-4 space-x-2">
        <input
          type="text"
          placeholder="Search candidates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchCandidates}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          <i className="fas fa-sync"></i>
        </button>
      </div>

      {/* Entries per page selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Show</span>
          <select
            value={entriesPerPage === -1 ? "all" : entriesPerPage.toString()}
            onChange={(e) => handleEntriesPerPageChange(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="all">All</option>
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>
        
        {/* Showing entries info */}
        <div className="text-sm text-gray-600 mr-15">
          {totalEntries === 0 ? (
            "No entries found"
          ) : entriesPerPage === -1 ? (
            `Showing all ${totalEntries} entries`
          ) : (
            `Showing ${Math.min((currentPage - 1) * entriesPerPage + 1, totalEntries)} to ${Math.min(currentPage * entriesPerPage, totalEntries)} of ${totalEntries} entries`
          )}
        </div>
      </div>

      {/* Table Container with Scroll Controls */}
      <div className="relative">
        <div 
          ref={tableContainerRef}
          className="overflow-x-auto shadow rounded-lg bg-white border border-gray-200" 
          style={{ maxWidth: 'calc(95vw - 320px)' }}
        >
          <table className="w-full border-collapse table-fixed min-w-[1600px]">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr className="text-center text-sm">
                <th className="p-3 border bg-gray-100 font-semibold w-[50px] sticky left-0 z-20 shadow-r">ID</th>
                <th className="p-3 border bg-gray-100 font-semibold w-[120px] sticky left-[50px] z-20 shadow-r">Name</th>
                <th className="p-3 border font-semibold w-[180px]">Email</th>
                <th className="p-3 border font-semibold w-[120px]">Phone</th>
                <th className="p-3 border font-semibold w-[105px]">Experience</th>
                <th className="p-3 border font-semibold w-[100px]">Current CTC</th>
                <th className="p-3 border font-semibold w-[100px]">Expected CTC</th>
                <th className="p-3 border font-semibold w-[100px]">Notice Period</th>
                <th className="p-3 border font-semibold w-[150px]">Skills</th>
                <th className="p-3 border font-semibold w-[90px]">LinkedIn</th>
                <th className="p-3 border font-semibold w-[80px]">Resume</th>
                <th className="p-3 border font-semibold w-[150px]">Notes</th>
                <th className="p-3 border font-semibold w-[200px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length ? (
                currentData.map((c, idx) => {
                  // Calculate the actual index based on current page
                  const actualIndex = entriesPerPage === -1 
                    ? idx + 1 
                    : (currentPage - 1) * entriesPerPage + idx + 1;
                  
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 text-center text-sm border-b">
                      <td className="p-3 border bg-white font-medium sticky left-0 z-10 shadow-r">{actualIndex}</td>
                      <td className="p-3 border bg-white font-medium sticky left-[50px] z-10 shadow-r">
                        <TooltipCell content={c.name} maxLength={12} />
                      </td>
                      <td className="p-3 border">
                        <TooltipCell content={c.email} maxLength={18} />
                      </td>
                      <td className="p-3 border">{c.phone} </td>
                      <td className="p-3 border">
                        <TooltipCell content={c.experience} maxLength={8} />
                      </td>
                      <td className="p-3 border">
                        <TooltipCell content={c.currentCTC} maxLength={10} />
                      </td>
                      <td className="p-3 border">
                        <TooltipCell content={c.expectedCTC} maxLength={10} />
                      </td>
                      <td className="p-3 border">
                        <TooltipCell content={c.noticePeriod} maxLength={10} />
                      </td>
                      <td className="p-3 border">
                        <TooltipCell content={c.skills} maxLength={15} />
                      </td>
                     
                      <td className="p-3 border">
                        <LinkCell url={c.linkedInProfile} text="Profile" />
                      </td>
                      <td className="p-3 border">
                        <LinkCell url={c.resumeLink} text="Resume" />
                      </td>
                      <td className="p-3 border">
                        <TooltipCell content={c.notes} maxLength={15} />
                      </td>
                      <td className="p-3 border bg-white">
                        <div className="flex justify-center items-center space-x-2">
                          {/* Call Button */}
                          <button
                            onClick={() => {
                              setSelectedCandidate(c);
                              setCallModal(true);
                            }}
                            className="text-teal-600 hover:text-teal-800 p-2 rounded hover:bg-teal-50 transition-colors"
                            title="Call Candidate"
                          >
                            <i className="fas fa-phone text-sm"></i>
                          </button>

                          {/* Send Email Button */}
                          <button
                            onClick={() => {
                              setSelectedCandidate(c);
                              setSendEmail("");
                              setSendModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-800 p-2 rounded hover:bg-purple-50 transition-colors"
                            title="Send Email"
                          >
                            <i className="fas fa-envelope text-sm"></i>
                          </button>

                          {/* Edit Button - Only show if user has permission */}
                          {hasEditDeletePermission && (
                            <button
                              onClick={() => {
                                setSelectedCandidate(c);
                                handleView(c.id);
                                setTimeout(() => setEditMode(true), 100);
                              }}
                              className="text-green-600 hover:text-green-800 p-2 rounded hover:bg-green-50 transition-colors"
                              title="Edit Candidate"
                            >
                              <i className="fas fa-edit text-sm"></i>
                            </button>
                          )}

                          {/* Delete Button - Only show if user has permission */}
                          {hasEditDeletePermission && (
                            <button
                              onClick={() => handleDeleteClick(c)}
                              className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                              title="Delete Candidate"
                            >
                              <i className="fas fa-trash text-sm"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-gray-500">
                    No candidates found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <style>{`
            .shadow-r {
              box-shadow: 2px 0 4px rgba(0,0,0,0.1);
            }
            
            .sticky {
              background-color: white !important;
            }
            
            table {
              border-spacing: 0;
            }
            
            .table-fixed {
              table-layout: fixed;
            }
          `}</style>
        </div>

        {/* Scroll Controls - Positioned at bottom right */}
        <div className="absolute right-16 mt-2 flex space-x-2 z-30">
          <button
            onClick={scrollLeft}
            className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
            title="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollRight}
            className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
            title="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pagination Controls */}
      {entriesPerPage !== -1 && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {/* First page */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700"
                  >
                    1
                  </button>
                  {currentPage > 4 && (
                    <span className="px-2 py-2 text-sm text-gray-500">...</span>
                  )}
                </>
              )}

              {/* Page numbers around current page */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      currentPage === pageNum
                        ? 'text-blue-600 bg-blue-50 border border-blue-300'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className="px-2 py-2 text-sm text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          
        </div>
      )}

      {/* Unified View/Edit Modal */}
      {viewModal && selectedCandidate && (
        <Modal title={editMode ? "Edit Candidate" : "Candidate Details"} onClose={() => setViewModal(false)}>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {editMode ? (
              <>
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={selectedCandidate.name || ''}
                    onChange={(e) => setSelectedCandidate({ ...selectedCandidate, name: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Full Name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={selectedCandidate.email || ''}
                    onChange={(e) => setSelectedCandidate({ ...selectedCandidate, email: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email Address"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    value={selectedCandidate.phone || ''}
                    onChange={(e) => setSelectedCandidate({ ...selectedCandidate, phone: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Phone Number"
                    required
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <input
                    type="text"
                    value={selectedCandidate.experience || ''}
                    onChange={(e) => setSelectedCandidate({ ...selectedCandidate, experience: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 3 years"
                  />
                </div>

                {/* Current CTC */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current CTC</label>
                  <input
                    type="text"
                    value={selectedCandidate.currentCTC || ''}
                    onChange={(e) => setSelectedCandidate({ ...selectedCandidate, currentCTC: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 5 LPA"
                  />
                </div>

                {/* Expected CTC */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected CTC</label>
                  <input
                    type="text"
                    value={selectedCandidate.expectedCTC || ''}
                    onChange={(e) => setSelectedCandidate({ ...selectedCandidate, expectedCTC: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 7 LPA"
                  />
                </div>

                {/* Notice Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period</label>
                  <input
                    type="text"
                    value={selectedCandidate.noticePeriod || ''}
                    onChange={(e) => setSelectedCandidate({ ...selectedCandidate, noticePeriod: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 1 month"
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <textarea
                    value={selectedCandidate.skills || ''}
                    onChange={(e) => setSelectedCandidate({ ...selectedCandidate, skills: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., React, Node.js, Python"
                    rows={3}
                  />
                </div>

                {/* LinkedIn Profile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                  <input
                    type="text"
                    value={selectedCandidate.linkedInProfile || ''}
                    onChange={(e) => setSelectedCandidate({ ...selectedCandidate, linkedInProfile: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="LinkedIn Profile URL"
                  />
                </div>

                {/* Resume Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resume Link</label>
                  <input
                    type="text"
                    value={selectedCandidate.resumeLink || ''}
                    onChange={(e) => setSelectedCandidate({ ...selectedCandidate, resumeLink: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Resume URL"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={selectedCandidate.notes || ''}
                    onChange={(e) => setSelectedCandidate({ ...selectedCandidate, notes: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional notes about the candidate"
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="text-gray-900">{selectedCandidate.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="text-gray-900">{selectedCandidate.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="text-gray-900">{selectedCandidate.phone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Experience:</span>
                    <span className="text-gray-900">{selectedCandidate.experience || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Current CTC:</span>
                    <span className="text-gray-900">{selectedCandidate.currentCTC || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Expected CTC:</span>
                    <span className="text-gray-900">{selectedCandidate.expectedCTC || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Notice Period:</span>
                    <span className="text-gray-900">{selectedCandidate.noticePeriod || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-700">Skills:</span>
                    <span className="text-gray-900 text-right max-w-xs">{selectedCandidate.skills || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-700">LinkedIn:</span>
                    <div className="text-right">
                      {selectedCandidate.linkedInProfile ? (
                        <a 
                          href={selectedCandidate.linkedInProfile} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all max-w-xs inline-block"
                        >
                          View Profile
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-700">Resume:</span>
                    <div className="text-right">
                      {selectedCandidate.resumeLink ? (
                        <a 
                          href={selectedCandidate.resumeLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all max-w-xs inline-block"
                        >
                          View Resume
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-700">Notes:</span>
                    <span className="text-gray-900 text-right max-w-xs">{selectedCandidate.notes || 'N/A'}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
            {editMode ? (
              <>
                <button 
                  onClick={() => setEditMode(false)} 
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate} 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                {/* Only show Edit button if user has permission */}
                {hasEditDeletePermission && (
                  <button 
                    onClick={handleEditClick} 
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                  >
                    Edit
                  </button>
                )}
                <button 
                  onClick={() => setViewModal(false)} 
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteModal && selectedCandidate && (
        <Modal title="Delete Candidate" onClose={() => setDeleteModal(false)}>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Candidate</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{selectedCandidate.name}</span>? 
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => setDeleteModal(false)} 
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete} 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Send Candidate Modal */}
      {sendModal && selectedCandidate && (
        <Modal title="Send Candidate Details" onClose={() => setSendModal(false)}>
          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
                <i className="fas fa-envelope text-purple-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Send Candidate Details</h3>
              <p className="text-gray-600">
                Send details of <span className="font-semibold">{selectedCandidate.name}</span> to:
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email</label>
              <input
                type="email"
                placeholder="Enter recipient email address"
                value={sendEmail}
                onChange={(e) => setSendEmail(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              onClick={() => setSendModal(false)} 
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => { 
                if (sendEmail.trim()) {
                  handleSendCandidateDetail(sendEmail, selectedCandidate.id); 
                  setSendModal(false); 
                } else {
                  toast.error("Please enter a valid email address");
                }
              }} 
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              disabled={!sendEmail.trim()}
            >
              Send Details
            </button>
          </div>
        </Modal>
      )}

      {/* Call Modal */}
      {callModal && selectedCandidate && (
        <Modal title="Call Candidate" onClose={() => setCallModal(false)}>
          <div className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 mb-4">
              <i className="fas fa-phone text-teal-600 text-2xl"></i>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Calling Candidate....</h3>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">{selectedCandidate.name}</span>
              </p>
              <p className="text-gray-600">
                Phone: <span className="font-semibold">{selectedCandidate.phone}</span>
              </p>
            </div>
            
          </div>
          
          <div className="flex justify-center space-x-3 mt-6">
            <button 
              onClick={() => setCallModal(false)} 
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
           
          </div>
        </Modal>
      )}
    </div>
  );
};

// Enhanced Modal Component
const Modal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 z-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b bg-gray-50">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-600 hover:text-gray-800" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        {children}
      </div>
    </div>
  </div>
);

export default ShowCandidatePage;