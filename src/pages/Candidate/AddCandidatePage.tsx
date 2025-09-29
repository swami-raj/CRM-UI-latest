import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE } from "../../utils/api";
import {
  Save,
  RotateCcw,
  User,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Calendar,
  Tag,
  Linkedin,
  Info,
  FileText,
  Upload,
  Download,
} from "lucide-react";

interface UserData {
  id?: number;
  departmentId: number;
  departmentName?: string;
  name: string;
  email?: string;
}

const AddCandidatePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    currentCTC: "",
    expectedCTC: "",
    noticePeriod: "",
    skills: "",
    linkedInProfile: "",
    notes: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
  const [sampleDownloadLoading, setSampleDownloadLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      experience: "",
      currentCTC: "",
      expectedCTC: "",
      noticePeriod: "",
      skills: "",
      linkedInProfile: "",
      notes: "",
    });
    setResumeFile(null);
  };

  const handleAddCandidate = async () => {
    const {
      name,
      email,
      phone,
      experience,
      currentCTC,
      expectedCTC,
      noticePeriod,
      skills,
      linkedInProfile,
    } = formData;

    if (
      !name ||
      !email ||
      !phone ||
      !experience ||
      !currentCTC ||
      !expectedCTC ||
      !noticePeriod ||
      !skills ||
      !linkedInProfile
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");

      // Step 1: Add candidate
      const res = await axios.post(`${API_BASE}/candidates/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.data.code === 1) {
        const candidateId = res.data.data.id;

        // Step 2: Upload resume if selected
        if (resumeFile) {
          const form = new FormData();
          form.append("file", resumeFile);
          await axios.post(
            `${API_BASE}/candidates/upload-single?candidateId=${candidateId}`,
            form,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }

        toast.success("Candidate added successfully!");
        resetForm();
      } else {
        toast.error(res.data.message || "Failed to add candidate");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add candidate");
    } finally {
      setLoading(false);
    }
  };

  // Bulk Upload handler - available for all users
  const handleBulkUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ['.csv', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error("Only CSV and XLSX files are allowed for bulk upload");
      return;
    }

    setBulkUploadLoading(true);
    const token = sessionStorage.getItem("token");
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Using the API_BASE endpoint
      const res = await axios.post(`${API_BASE}/import/candidates`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.code === 1) {
        toast.success(res.data.message || "Bulk upload successful!");
      } else {
        toast.error(res.data.message || "Bulk upload failed");
      }
    } catch (error: any) {
      console.error("Bulk upload error:", error);
      toast.error(error?.response?.data?.message || "Bulk upload failed");
    } finally {
      setBulkUploadLoading(false);
    }
  };

  // Handle bulk upload button click - available for all users
  const handleBulkUploadClick = () => {
    document.getElementById("bulkUploadInput")?.click();
  };

  // Download sample data format handler - available for all users
  const handleSampleDownload = async () => {
    setSampleDownloadLoading(true);
    
    try {
      // Create sample CSV data
      const sampleData = `name,email,phone,experience,currentCTC,expectedCTC,noticePeriod,skills,linkedInProfile,notes
John Doe,john.doe@email.com,9876543210,3 years,5 LPA,7 LPA,1 month,"React, Node.js, JavaScript",https://linkedin.com/in/johndoe,Excellent candidate with good technical skills
Jane Smith,jane.smith@email.com,8765432109,5 years,8 LPA,12 LPA,2 months,"Python, Django, PostgreSQL",https://linkedin.com/in/janesmith,Senior developer with leadership experience
Mike Johnson,mike.johnson@email.com,7654321098,2 years,3.5 LPA,5 LPA,Immediate,"HTML, CSS, JavaScript, Vue.js",https://linkedin.com/in/mikejohnson,Junior developer eager to learn`;

      // Create blob and download
      const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'candidate_sample_format.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Sample format downloaded successfully!");
    } catch (error: any) {
      console.error("Sample download error:", error);
      toast.error("Failed to download sample format");
    } finally {
      setSampleDownloadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with Bulk Upload */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Add Candidate
            </h1>
            <p className="text-gray-500 mt-1">
              Fill out the form to add a new candidate and upload resume.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sample Format Download - Available for all users */}
            <button
              type="button"
              onClick={handleSampleDownload}
              disabled={sampleDownloadLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sampleDownloadLoading ? (
                <>
                  <RotateCcw className="animate-spin w-4 h-4 mr-2" /> Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" /> Sample format
                </>
              )}
            </button>

            {/* Bulk Upload - Available for all users */}
            <input
              id="bulkUploadInput"
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleBulkUpload(e.target.files[0]);
                  // Reset the input to allow same file upload again
                  e.target.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={handleBulkUploadClick}
              disabled={bulkUploadLoading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkUploadLoading ? (
                <>
                  <RotateCcw className="animate-spin w-4 h-4 mr-2" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" /> Bulk Upload
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow-md rounded-xl p-8 space-y-6">
          {/* Inputs */}
          <div className="space-y-4">
            <InputField
              label="Name*"
              icon={<User className="w-4 h-4 mr-2 text-blue-600" />}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
            />
            <InputField
              label="Email*"
              icon={<Mail className="w-4 h-4 mr-2 text-blue-600" />}
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              type="email"
              disabled={loading}
            />
            <InputField
              label="Phone*"
              icon={<Phone className="w-4 h-4 mr-2 text-blue-600" />}
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={loading}
            />
            <InputField
              label="Experience*"
              icon={<Briefcase className="w-4 h-4 mr-2 text-blue-600" />}
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              disabled={loading}
            />
            <InputField
              label="Current CTC*"
              icon={<DollarSign className="w-4 h-4 mr-2 text-blue-600" />}
              name="currentCTC"
              value={formData.currentCTC}
              onChange={handleInputChange}
              disabled={loading}
            />
            <InputField
              label="Expected CTC*"
              icon={<DollarSign className="w-4 h-4 mr-2 text-blue-600" />}
              name="expectedCTC"
              value={formData.expectedCTC}
              onChange={handleInputChange}
              disabled={loading}
            />
            <InputField
              label="Notice Period*"
              icon={<Calendar className="w-4 h-4 mr-2 text-blue-600" />}
              name="noticePeriod"
              value={formData.noticePeriod}
              onChange={handleInputChange}
              disabled={loading}
            />
            <InputField
              label="Skills*"
              icon={<Tag className="w-4 h-4 mr-2 text-blue-600" />}
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              disabled={loading}
            />
            <InputField
              label="LinkedIn Profile*"
              icon={<Linkedin className="w-4 h-4 mr-2 text-blue-600" />}
              name="linkedInProfile"
              value={formData.linkedInProfile}
              onChange={handleInputChange}
              disabled={loading}
            />

            <TextAreaField
              label="Notes"
              icon={<Info className="w-4 h-4 mr-2 text-blue-600" />}
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              disabled={loading}
            />

            {/* Resume */}
            <div>
              <label className="flex flex-col text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("resumeInput")?.click()
                    }
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    disabled={loading}
                  >
                    <FileText className="w-4 h-4 mr-2" /> Upload Resume
                  </button>
                  {resumeFile && (
                    <span className="text-gray-600 text-sm truncate max-w-xs">
                      {resumeFile.name}
                    </span>
                  )}
                </div>
              </label>
              <input
                id="resumeInput"
                type="file"
                accept="application/pdf"
                onChange={(e) =>
                  setResumeFile(e.target.files ? e.target.files[0] : null)
                }
                className="hidden"
                disabled={loading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="flex items-center px-6 py-3 border rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </button>
            <button
              type="button"
              onClick={handleAddCandidate}
              disabled={loading}
              className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <RotateCcw className="animate-spin w-4 h-4 mr-2" /> Adding...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Add Candidate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Input Component
const InputField = ({
  label,
  icon,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
}: any) => (
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
const TextAreaField = ({
  label,
  icon,
  name,
  value,
  onChange,
  disabled = false,
}: any) => (
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
      rows={3}
    />
  </div>
);

export default AddCandidatePage;