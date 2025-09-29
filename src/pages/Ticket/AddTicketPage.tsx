import  { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE } from "../../utils/api";
import { User, Users, RefreshCcw, ClipboardList, Calendar } from "lucide-react";

const AddTicketPage = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    candidateId: "",
    userId: "",
    status: "Open",
    remarks: "",
    nextFollowUpDate: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");

        // fetch candidates
        const candidateRes = await axios.get(`${API_BASE}/candidates/get-all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (candidateRes.data.code === 1) setCandidates(candidateRes.data.data || []);

        // fetch logged in user
        const userRes = await axios.get(`${API_BASE}/auth/getById/1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.data.code === 1) {
          setCurrentUser(userRes.data.data);
          setFormData((prev) => ({
            ...prev,
            userId: userRes.data.data.id,
          }));
        }
      } catch {
        toast.error("Failed to fetch data");
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      candidateId: "",
      userId: "",
      status: "Open",
      remarks: "",
      nextFollowUpDate: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidateId || !formData.userId) {
      toast.error("Candidate and assigned user are required");
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const body = {
        id: 0,
        candidateId: Number(formData.candidateId),
        userId: Number(formData.userId),
        status: formData.status,
        remarks: formData.remarks,
        nextFollowUpDate: formData.nextFollowUpDate,
      };

      const res = await axios.post(`${API_BASE}/ticket/add`, body, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (res.data.code === 1) {
        toast.success("Ticket created successfully!");
        resetForm();
      } else {
        toast.error(res.data.message || "Failed to create ticket");
      }
    } catch {
      toast.error("Something went wrong while creating ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Add Ticket</h1>
          <p className="text-gray-500 mt-1">Assign a candidate to a user and set ticket details.</p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-8 space-y-6">
          {/* Candidate */}
          <SelectField
            label="Candidate"
            icon={<User className="w-4 h-4 mr-2 text-blue-600" />}
            name="candidateId"
            value={formData.candidateId}
            onChange={handleInputChange}
            options={candidates.map((c) => ({ value: c.id, label: `${c.name} (${c.email})` }))}
            placeholder="Select Candidate"
            disabled={loading}
          />

          
         {/* Assigned User (Auto-filled) */}
<div>
  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
    <Users className="w-4 h-4 mr-2 text-blue-600" /> Assigned To
  </label>
  <input
    type="text"
    value={currentUser ? `${currentUser.name} (${currentUser.email})` : "Loading..."}
    disabled
    className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-600"
  />
</div>


          {/* Status */}
          <SelectField
            label="Status"
            icon={<ClipboardList className="w-4 h-4 mr-2 text-blue-600" />}
            name="current status"
            value={formData.status}
            onChange={handleInputChange}
            options={[
              { value: "Open", label: "Open" },
              { value: "In Progress", label: "In Progress" },
              { value: "On Hold", label: "On Hold" },
              { value: "Closed", label: "Closed" },
            ]}
            disabled={loading}
          />

          {/* Remarks */}
          <TextAreaField
            label="Remarks"
            icon={<ClipboardList className="w-4 h-4 mr-2 text-blue-600" />}
            name="remarks"
            value={formData.remarks}
            onChange={handleInputChange}
            disabled={loading}
          />

          {/* Next Follow Up */}
          <InputField
            label="Next Follow Up Date"
            icon={<Calendar className="w-4 h-4 mr-2 text-blue-600" />}
            name="nextFollowUpDate"
            value={formData.nextFollowUpDate}
            onChange={handleInputChange}
            type="date"
            disabled={loading}
          />

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="flex items-center px-6 py-3 border rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCcw className="w-4 h-4 mr-2" /> Reset
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? <span>Creating...</span> : "Add Ticket"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Input Component
const InputField = ({ label, icon, name, value, onChange, type = "text", disabled = false }: any) => (
  <div>
    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
      {icon} {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
    />
  </div>
);

// Reusable TextArea Component
const TextAreaField = ({ label, icon, name, value, onChange, disabled = false }: any) => (
  <div>
    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
      {icon} {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
    />
  </div>
);

// Reusable Select Component
const SelectField = ({ label, icon, name, value, onChange, options, placeholder, disabled = false }: any) => (
  <div>
    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
      {icon} {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
    >
      <option value="">{placeholder}</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default AddTicketPage;
