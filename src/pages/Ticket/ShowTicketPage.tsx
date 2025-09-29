import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE } from "../../utils/api";
import { X, ChevronDown, ChevronRight, Filter, ChevronLeft } from "lucide-react";

const ShowTicketPage = () => {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [expandedTickets, setExpandedTickets] = useState<Set<number>>(new Set());
  const [ticketLogHistory, setTicketLogHistory] = useState<{[key: number]: any[]}>({});
  
  // Filter state - Initialize from URL parameter
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  
  // Selection states for modal only
  const [selectedTicketsInModal, setSelectedTicketsInModal] = useState<Set<number>>(new Set());
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [modalSearch, setModalSearch] = useState("");

  const [editForm, setEditForm] = useState({
    id: 0,
    ticketId: 0,
    remarks: "",
    status: "",
    nextFollowUpDate: "",
  });

  useEffect(() => {
    // Read status filter from URL parameter and set it
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) {
      setStatusFilter(statusFromUrl);
    }
    
    fetchTickets();
  }, [searchParams]);

  // Prevent body scroll when any modal is open
  useEffect(() => {
    if (assignModal || editModal || deleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [assignModal, editModal, deleteModal]);

  // Update dropdown position when it opens
  useEffect(() => {
    if (showFilterDropdown && filterButtonRef.current) {
      const rect = filterButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
    }
  }, [showFilterDropdown]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/ticket/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1) setTickets(res.data.data);
      else toast.error(res.data.message || "Failed to fetch tickets");
    } catch {
      toast.error("Error fetching tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get("http://13.127.232.90:8081/auth/get-all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1) setUsers(res.data.data);
      else toast.error(res.data.message || "Failed to fetch users");
    } catch {
      toast.error("Error fetching users");
    }
  };

  const handleDelete = async () => {
    if (!selectedTicket) return;
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.delete(`${API_BASE}/ticket/delete/${selectedTicket.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1) {
        toast.success("Ticket deleted successfully");
        setDeleteModal(false);
        fetchTickets();
      } else toast.error(res.data.message || "Failed to delete ticket");
    } catch {
      toast.error("Error deleting ticket");
    }
  };

  const fetchLogHistory = async (ticketId: number) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/log-history/get-by-ticket-id?ticketId=${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.code === 1) {
        setTicketLogHistory(prev => ({
          ...prev,
          [ticketId]: res.data.data || []
        }));
      } else toast.error(res.data.message || "Failed to fetch log history");
    } catch {
      toast.error("Error fetching log history");
    }
  };

  const toggleRowExpansion = async (ticket: any) => {
    const isExpanded = expandedTickets.has(ticket.id);
    const newExpanded = new Set(expandedTickets);
    
    if (isExpanded) {
      newExpanded.delete(ticket.id);
    } else {
      newExpanded.add(ticket.id);
      if (!ticketLogHistory[ticket.id]) {
        await fetchLogHistory(ticket.id);
      }
    }
    
    setExpandedTickets(newExpanded);
  };

  const handleEdit = (ticket: any) => {
    setEditForm({
      id: 0,
      ticketId: ticket.id,
      remarks: "",
      status: ticket.status,
      nextFollowUpDate: ticket.nextFollowUpDate,
    });
    setEditModal(true);
  };

  const handleAddLogHistory = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.post(`${API_BASE}/log-history/add`, editForm, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.data.code === 1) {
        toast.success("Log history added successfully");
        setEditModal(false);
        await fetchLogHistory(editForm.ticketId);
        fetchTickets();
      } else toast.error(res.data.message || "Failed to add log history");
    } catch {
      toast.error("Error adding log history");
    }
  };

  // Modal Selection handlers
  const handleSelectTicketInModal = (ticketId: number) => {
    const newSelected = new Set(selectedTicketsInModal);
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId);
    } else {
      newSelected.add(ticketId);
    }
    setSelectedTicketsInModal(newSelected);
  };

  const handleSelectAllInModal = () => {
    const modalFilteredTickets = getModalFilteredTickets();
    if (selectedTicketsInModal.size === modalFilteredTickets.length) {
      setSelectedTicketsInModal(new Set());
    } else {
      setSelectedTicketsInModal(new Set(modalFilteredTickets.map(t => t.id)));
    }
  };

  const handleSelectCountInModal = (count: number) => {
    const modalFilteredTickets = getModalFilteredTickets();
    const ticketIds = modalFilteredTickets.slice(0, count).map(t => t.id);
    setSelectedTicketsInModal(new Set(ticketIds));
  };

  const handleSelectNoneInModal = () => {
    setSelectedTicketsInModal(new Set());
  };

  // Get filtered tickets for modal with modal search
  const getModalFilteredTickets = () => {
    return filteredTickets.filter(
      (t) =>
        t.candidateName.toLowerCase().includes(modalSearch.toLowerCase()) ||
        t.assignedTo.toLowerCase().includes(modalSearch.toLowerCase()) ||
        t.ticketId.toLowerCase().includes(modalSearch.toLowerCase())
    );
  };

  // Assignment handlers
  const handleOpenAssignModal = async () => {
    setAssignModal(true);
    setSelectedTicketsInModal(new Set()); // Reset selection when opening modal
    setModalSearch(""); // Reset modal search
    await fetchUsers();
  };

  const handleAssignTickets = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }
    if (selectedTicketsInModal.size === 0) {
      toast.error("Please select at least one ticket");
      return;
    }

    try {
      setAssignLoading(true);
      const token = sessionStorage.getItem("token");
      
      // Get candidate IDs from selected tickets
      const selectedTicketsList = Array.from(selectedTicketsInModal);
      const candidateIds = tickets
        .filter(ticket => selectedTicketsList.includes(ticket.id))
        .map(ticket => ticket.candidateId); // Assuming there's a candidateId field
      
      const assignmentData = {
        userId: parseInt(selectedUser),
        candidateIds: candidateIds
      };

      const res = await axios.post("http://13.127.232.90:8081/status/assign", assignmentData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (res.data.code === 1) {
        toast.success("Tickets assigned to user successfully");
        setAssignModal(false);
        setSelectedUser("");
        setSelectedTicketsInModal(new Set());
        setModalSearch("");
        fetchTickets();
      } else {
        toast.error(res.data.message || "Failed to assign tickets");
      }
    } catch {
      toast.error("Error assigning tickets");
    } finally {
      setAssignLoading(false);
    }
  };

  const getFilteredTickets = () => {
    let filtered = tickets.filter(
      (t) =>
        t.candidateName.toLowerCase().includes(search.toLowerCase()) ||
        t.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
        t.ticketId.toLowerCase().includes(search.toLowerCase())
    );

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    return filtered;
  };

  const filteredTickets = getFilteredTickets();

  // Pagination calculations
  const totalEntries = filteredTickets.length;
  const totalPages = entriesPerPage === -1 ? 1 : Math.ceil(totalEntries / entriesPerPage);
  
  // Get current page data
  const getCurrentPageData = () => {
    if (entriesPerPage === -1) {
      return filteredTickets; // Show all entries
    }
    
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredTickets.slice(startIndex, endIndex);
  };

  const currentData = getCurrentPageData();

  // Reset to first page when search changes or entries per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, entriesPerPage, statusFilter]);

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

  const statusOptions = ["ALL", "OPEN", "INPROGRESS", "ONHOLD", "CLOSE", "COMPLETED"];

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="w-full max-w-none overflow-hidden">
        <h1 className="text-2xl font-bold mb-6">
          Tickets
          {/* Show current filter in title if not ALL */}
          {statusFilter !== "ALL" && (
            <span className="text-lg font-normal text-gray-600 ml-2">
              - Filtered by: <span className="font-semibold text-blue-600">{statusFilter}</span>
            </span>
          )}
        </h1>

        {/* Search + Refresh + Filter + Assign Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 flex-1">
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 max-w-md border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchTickets}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <i className="fas fa-sync"></i>
            </button>
            
            {/* Status Filter Button */}
            <div className="relative z-30">
              <button
                ref={filterButtonRef}
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filter: {statusFilter}</span>
              </button>
            </div>
          </div>
          
          <button
            onClick={handleOpenAssignModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Assigned To
          </button>
        </div>

        {/* Show filter info if coming from dashboard */}
        {searchParams.get('status') && statusFilter !== "ALL" && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <i className="fas fa-info-circle mr-2"></i>
              Showing tickets with status: <strong>{statusFilter}</strong>
              <button 
                onClick={() => setStatusFilter("ALL")} 
                className="ml-3 text-blue-600 hover:text-blue-800 underline text-xs"
              >
                Clear filter
              </button>
            </p>
          </div>
        )}

        {/* Filter Dropdown Portal - Rendered outside overflow container */}
        {showFilterDropdown && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowFilterDropdown(false)}
          >
            <div 
              className="absolute bg-white border rounded-lg shadow-lg min-w-[150px]"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setShowFilterDropdown(false);
                  }}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    statusFilter === status ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}

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
          <div className="text-sm text-gray-600">
            {totalEntries === 0 ? (
              "No entries found"
            ) : entriesPerPage === -1 ? (
              `Showing all ${totalEntries} entries`
            ) : (
              `Showing ${Math.min((currentPage - 1) * entriesPerPage + 1, totalEntries)} to ${Math.min(currentPage * entriesPerPage, totalEntries)} of ${totalEntries} entries`
            )}
          </div>
        </div>

        {/* Tickets Table without checkbox column */}
        <div className="overflow-x-auto shadow rounded-lg">
          <div className="relative">
            <table className="w-full border-collapse border border-gray-300 min-w-[1000px]">
              <thead className="bg-gray-100 sticky top-0 z-20">
                <tr className="text-center">
                  {/* Frozen columns */}
                  <th className="p-2 border bg-gray-100 sticky left-0 z-30 min-w-[120px]">Ticket ID</th>
                  <th className="p-2 border bg-gray-100 sticky left-[120px] z-30 min-w-[150px]">Candidate</th>
                  {/* Scrollable columns */}
                  <th className="p-2 border min-w-[120px]">Assigned To</th>
                  <th className="p-2 border min-w-[100px]">Status</th>
                  <th className="p-2 border min-w-[150px]">Next Follow Up</th>
                  <th className="p-2 border min-w-[200px]">Remarks</th>
                  <th className="p-2 border min-w-[120px]">Actions</th>
                  <th className="p-2 border min-w-[80px]">Expand</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length ? (
                  currentData.map((ticket) => (
                    <>
                      {/* Main ticket row */}
                      <tr key={ticket.id} className="text-center hover:bg-gray-50 border-b">
                        {/* Frozen columns */}
                        <td className="p-2 border bg-white sticky left-0 z-10 font-medium">{ticket.ticketId}</td>
                        <td className="p-2 border bg-white sticky left-[120px] z-10 font-medium">{ticket.candidateName}</td>
                        {/* Scrollable columns */}
                        <td className="p-2 border">{ticket.assignedTo}</td>
                        <td className="p-2 border">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'INPROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                            ticket.status === 'ONHOLD' ? 'bg-orange-100 text-orange-800' :
                            ticket.status === 'CLOSE' ? 'bg-gray-100 text-gray-800' :
                            ticket.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="p-2 border">{ticket.nextFollowUpDate}</td>
                        <td className="p-2 border">
                          <div className="truncate max-w-[200px]" title={ticket.remarks}>
                            {ticket.remarks || 'No remarks'}
                          </div>
                        </td>
                        <td className="p-2 border space-x-3">
                          <button onClick={() => handleEdit(ticket)} className="text-green-600 hover:text-green-800">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => { setSelectedTicket(ticket); setDeleteModal(true); }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                        <td className="p-2 border">
                          <button
                            onClick={() => toggleRowExpansion(ticket)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            {expandedTickets.has(ticket.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded log history row */}
                      {expandedTickets.has(ticket.id) && (
                        <tr key={`${ticket.id}-expanded`} className="bg-gray-50">
                          <td colSpan={8} className="p-0 border-b">
                            <div className="p-4 bg-blue-50">
                              <h4 className="font-semibold text-gray-800 mb-3">Log History</h4>
                              {ticketLogHistory[ticket.id]?.length ? (
                                <div className="space-y-3">
                                  {ticketLogHistory[ticket.id].map((log, idx) => (
                                    <div key={idx} className="p-3 border-l-4 border-blue-600 bg-white rounded-r shadow-sm">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium text-gray-900">
                                            Status: <span className={`px-2 py-1 rounded text-xs ${
                                              log.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                                              log.status === 'INPROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                              log.status === 'ONHOLD' ? 'bg-orange-100 text-orange-800' :
                                              log.status === 'ClOSED' ? 'bg-gray-100 text-gray-800' :
                                              log.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}>{log.status}</span>
                                          </p>
                                          <p className="text-gray-800 mt-2">{log.remarks}</p>
                                          <p className="text-sm text-gray-500 mt-1">Next Follow Up: {log.nextFollowUpDate}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500">No log history found.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                ) : (
                  <tr>
                    <td className="p-4 text-center text-gray-500" colSpan={8}>
                      {loading ? "Loading..." : "No tickets found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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

            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}

        {/* Assignment Modal with Ticket Table */}
        {assignModal && (
          <Modal title="Assign Tickets to User" onClose={() => setAssignModal(false)} size="xl">
            <div className="space-y-4">
              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email}) - {user.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Bar for Modal Table */}
              <div>
                <input
                  type="text"
                  placeholder="Search tickets in table..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Ticket Selection Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    Selected: {selectedTicketsInModal.size} of {getModalFilteredTickets().length}
                  </span>
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'select-10') handleSelectCountInModal(10);
                      else if (value === 'select-50') handleSelectCountInModal(50);
                      else if (value === 'select-all') handleSelectAllInModal();
                      else if (value === 'select-none') handleSelectNoneInModal();
                      // Reset dropdown to default
                      e.target.value = '';
                    }}
                    className="border rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                    defaultValue=""
                  >
                    <option value="" disabled>Select Options</option>
                    <option value="select-10">Select 10</option>
                    <option value="select-50">Select 50</option>
                    <option value="select-all">
                      {selectedTicketsInModal.size === getModalFilteredTickets().length && getModalFilteredTickets().length > 0 ? 'Deselect All' : 'Select All'}
                    </option>
                    <option value="select-none">Select None</option>
                  </select>
                </div>
              </div>

              {/* Tickets Table in Modal */}
              <div className="max-h-96 overflow-auto border rounded">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr className="text-center">
                      <th className="p-2 border">
                        <input
                          type="checkbox"
                          checked={selectedTicketsInModal.size === getModalFilteredTickets().length && getModalFilteredTickets().length > 0}
                          onChange={handleSelectAllInModal}
                          className="w-4 h-4"
                        />
                      </th>
                      <th className="p-2 border">Ticket ID</th>
                      <th className="p-2 border">Candidate</th>
                      <th className="p-2 border">Assigned To</th>
                      <th className="p-2 border">Status</th>
                      <th className="p-2 border">Next Follow Up</th>
                      <th className="p-2 border">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getModalFilteredTickets().length > 0 ? (
                      getModalFilteredTickets().map((ticket) => (
                        <tr key={ticket.id} className="text-center hover:bg-gray-50">
                          <td className="p-2 border">
                            <input
                              type="checkbox"
                              checked={selectedTicketsInModal.has(ticket.id)}
                              onChange={() => handleSelectTicketInModal(ticket.id)}
                              className="w-4 h-4"
                            />
                          </td>
                          <td className="p-2 border font-medium">{ticket.ticketId}</td>
                          <td className="p-2 border">{ticket.candidateName}</td>
                          <td className="p-2 border">{ticket.assignedTo}</td>
                          <td className="p-2 border">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                              ticket.status === 'INPROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                              ticket.status === 'ONHOLD' ? 'bg-orange-100 text-orange-800' :
                              ticket.status === 'CLOSE' ? 'bg-gray-100 text-gray-800' :
                              ticket.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="p-2 border">{ticket.nextFollowUpDate}</td>
                          <td className="p-2 border">
                            <div className="truncate max-w-[150px]" title={ticket.remarks}>
                              {ticket.remarks || 'No remarks'}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-4 text-center text-gray-500" colSpan={7}>
                          No tickets found matching your search
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-blue-900">
                  <strong>Summary:</strong> {selectedTicketsInModal.size} ticket(s) selected to be assigned to the selected user
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setAssignModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTickets}
                disabled={assignLoading || !selectedUser || selectedTicketsInModal.size === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {assignLoading ? "Assigning..." : "Assign Tickets"}
              </button>
            </div>
          </Modal>
        )}

        {/* Edit Modal */}
        {editModal && (
          <Modal title="Add Log History" onClose={() => setEditModal(false)}>
            <div className="space-y-3">
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Status</option>
                <option value="OPEN">OPEN</option>
                <option value="INPROGRESS">INPROGRESS</option>
                <option value="ONHOLD">ONHOLD</option>
                <option value="CLOSED">CLOSED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>

              <textarea
                value={editForm.remarks}
                onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                placeholder="Remarks"
                className="w-full border p-2 rounded"
                rows={4}
              />

              <input
                type="date"
                value={editForm.nextFollowUpDate}
                onChange={(e) => setEditForm({ ...editForm, nextFollowUpDate: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => setEditModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={handleAddLogHistory} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
            </div>
          </Modal>
        )}

        {/* Delete Modal */}
        {deleteModal && selectedTicket && (
          <Modal title="Confirm Delete" onClose={() => setDeleteModal(false)}>
            <p>Are you sure you want to delete ticket <b>{selectedTicket.ticketId}</b>?</p>
            <div className="mt-4 flex justify-around">
              <button onClick={() => setDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

// Updated Modal Component - Shifted left and lower
const Modal = ({ title, children, onClose, size = "md" }: any) => {
  // Calculate modal width and position based on size
  const getModalClasses = () => {
    switch (size) {
      case 'xl':
        return 'w-[75vw] max-w-5xl'; // Reduced from max-w-6xl
      case 'lg':
        return 'w-[60vw] max-w-3xl'; // Reduced from max-w-2xl  
      default:
        return 'w-[40vw] max-w-lg'; // Reduced from max-w-md
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Content - Positioned slightly left and lower */}
      <div className="flex justify-center items-center h-full p-4" style={{ marginLeft: '18vw', marginTop: '1vh' }}>
        <div className={`relative bg-white rounded-lg shadow-2xl ${getModalClasses()} max-h-[85vh] overflow-y-auto transform transition-all duration-300 ease-out`}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              <button 
                onClick={onClose} 
                className="hover:bg-gray-100 rounded-full p-2 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-600 hover:text-gray-800" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowTicketPage;