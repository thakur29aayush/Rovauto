
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiEdit, FiClock, FiUsers, FiFileText, FiCreditCard, FiCheck, FiChevronDown, FiChevronUp, FiPlus, FiTrash2, FiUpload } from "react-icons/fi";
import { setGarage } from "@/store/garageSlice";
import { mockBrands } from "@/data/garageData";

export default function GarageProfile() {
  const { garage } = useSelector(state => state.garage);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [formData, setFormData] = useState({
    name: garage?.name || "",
    address: garage?.address || "",
    phone: garage?.phone || "",
    email: garage?.email || "",
  });
  // Section-specific data
  const [workingHours, setWorkingHours] = useState(garage?.workingHours || {
    monday: { open: "09:00", close: "18:00" },
    tuesday: { open: "09:00", close: "18:00" },
    wednesday: { open: "09:00", close: "18:00" },
    thursday: { open: "09:00", close: "18:00" },
    friday: { open: "09:00", close: "18:00" },
    saturday: { open: "09:00", close: "14:00" },
    sunday: { open: "Closed", close: "Closed" },
  });
  const [mechanics, setMechanics] = useState(garage?.mechanics || [
    { id: 1, name: "Raj Kumar", phone: "+91 98765 43210" },
    { id: 2, name: "Suresh Singh", phone: "+91 91234 56789" },
  ]);
  const [newMechanic, setNewMechanic] = useState({ name: "", phone: "" });
  const [documents, setDocuments] = useState(garage?.documents || [
    { id: 1, name: "GST Certificate", status: "Uploaded" },
    { id: 2, name: "Shop License", status: "Pending" },
  ]);
  const [paymentDetails, setPaymentDetails] = useState(garage?.paymentDetails || {
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  });
  const [selectedBrands, setSelectedBrands] = useState(garage?.brands || []);

  const sections = [
    {
      id: "brands",
      icon: FiCheck,
      title: "Brands",
      description: "Select brands you service"
    },
    {
      id: "workingHours",
      icon: FiClock,
      title: "Working Hours",
      description: "Set your garage operating hours"
    },
    {
      id: "mechanics",
      icon: FiUsers,
      title: "Mechanics",
      description: "Manage your team members"
    },
    {
      id: "documents",
      icon: FiFileText,
      title: "Documents",
      description: "Upload required documents"
    },
    {
      id: "paymentDetails",
      icon: FiCreditCard,
      title: "Payment Details",
      description: "Bank account & UPI details"
    }
  ];

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    dispatch(setGarage({ ...garage, ...formData, workingHours, mechanics, documents, paymentDetails, brands: selectedBrands }));
    setIsEditing(false);
    setLoading(false);
  };

  const addMechanic = () => {
    if (newMechanic.name && newMechanic.phone) {
      setMechanics([...mechanics, { id: Date.now(), ...newMechanic }]);
      setNewMechanic({ name: "", phone: "" });
    }
  };

  const removeMechanic = (id) => {
    setMechanics(mechanics.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted">Manage your garage information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => {
              setFormData({
                name: garage?.name || "",
                address: garage?.address || "",
                phone: garage?.phone || "",
                email: garage?.email || "",
              });
              setWorkingHours(garage?.workingHours || {
                monday: { open: "09:00", close: "18:00" },
                tuesday: { open: "09:00", close: "18:00" },
                wednesday: { open: "09:00", close: "18:00" },
                thursday: { open: "09:00", close: "18:00" },
                friday: { open: "09:00", close: "18:00" },
                saturday: { open: "09:00", close: "14:00" },
                sunday: { open: "Closed", close: "Closed" },
              });
              setMechanics(garage?.mechanics || [
                { id: 1, name: "Raj Kumar", phone: "+91 98765 43210" },
                { id: 2, name: "Suresh Singh", phone: "+91 91234 56789" },
              ]);
              setDocuments(garage?.documents || [
                { id: 1, name: "GST Certificate", status: "Uploaded" },
                { id: 2, name: "Shop License", status: "Pending" },
              ]);
              setPaymentDetails(garage?.paymentDetails || {
                bankName: "",
                accountNumber: "",
                ifscCode: "",
                upiId: "",
              });
              setSelectedBrands(garage?.brands || []);
              setIsEditing(true);
            }}
            className="btn-ghost"
          >
            <FiEdit className="w-4 h-4" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setActiveSection(null);
                // Reset all state to original values from garage
                setFormData({
                  name: garage?.name || "",
                  address: garage?.address || "",
                  phone: garage?.phone || "",
                  email: garage?.email || "",
                });
                setWorkingHours(garage?.workingHours || {
                  monday: { open: "09:00", close: "18:00" },
                  tuesday: { open: "09:00", close: "18:00" },
                  wednesday: { open: "09:00", close: "18:00" },
                  thursday: { open: "09:00", close: "18:00" },
                  friday: { open: "09:00", close: "18:00" },
                  saturday: { open: "09:00", close: "14:00" },
                  sunday: { open: "Closed", close: "Closed" },
                });
                setMechanics(garage?.mechanics || [
                  { id: 1, name: "Raj Kumar", phone: "+91 98765 43210" },
                  { id: 2, name: "Suresh Singh", phone: "+91 91234 56789" },
                ]);
                setDocuments(garage?.documents || [
                  { id: 1, name: "GST Certificate", status: "Uploaded" },
                  { id: 2, name: "Shop License", status: "Pending" },
                ]);
                setPaymentDetails(garage?.paymentDetails || {
                  bankName: "",
                  accountNumber: "",
                  ifscCode: "",
                  upiId: "",
                });
                setSelectedBrands(garage?.brands || []);
              }}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Saving..." : (
                <>
                  <FiCheck className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="card-soft p-6">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-24 h-24 rounded-2xl bg-brand-soft flex items-center justify-center text-3xl font-bold">
            {(isEditing ? formData.name : garage?.name)?.[0]}
          </div>

        <div className="flex-1 space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Garage Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors resize-none"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{garage?.name}</h2>
                <p className="text-muted">{garage?.address}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-muted">{garage?.phone}</span>
                  <span className="text-muted">{garage?.email}</span>
                </div>
                {/* Show selected brands when not editing */}
                {garage?.brands && garage.brands.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {mockBrands
                      .filter(b => garage.brands.includes(b.id))
                      .map(brand => {
                        const Icon = brand.icon;
                        return (
                          <div key={brand.id} className="flex items-center gap-2 bg-bg-soft px-3 py-1 rounded-full text-sm">
                            {brand.image ? (
                              <img
                                src={brand.image}
                                alt={brand.name}
                                className="h-4 w-4 object-contain"
                              />
                            ) : Icon ? (
                              <Icon className="h-4 w-4" />
                            ) : (
                              <span className="font-bold">{brand.name.charAt(0)}</span>
                            )}
                            <span>{brand.name}</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="card-soft">
            <button
              onClick={() => isEditing && setActiveSection(activeSection === section.id ? null : section.id)}
              disabled={!isEditing}
              className={`w-full p-6 text-left flex items-center justify-between transition-all rounded-2xl ${isEditing ? "hover:bg-bg-soft cursor-pointer" : "cursor-not-allowed opacity-70"}`}
            >
              <div className="flex items-center gap-4">
                <section.icon className="w-8 h-8 text-brand" />
                <div>
                  <h3 className="text-lg font-bold">{section.title}</h3>
                  <p className="text-muted text-sm">{section.description}</p>
                </div>
              </div>
              {isEditing && (activeSection === section.id ? <FiChevronUp /> : <FiChevronDown />)}
            </button>

            {isEditing && activeSection === section.id && (
              <div className="p-6 pt-0 border-t border-line">
                {/* Brands */}
                {section.id === "brands" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {mockBrands.map((brand) => {
                        const Icon = brand.icon;
                        
                        return (
                          <button
                            key={brand.id}
                            type="button"
                            onClick={() => {
                              setSelectedBrands(
                                selectedBrands.includes(brand.id)
                                  ? selectedBrands.filter(id => id !== brand.id)
                                  : [...selectedBrands, brand.id]
                              );
                            }}
                            className={`p-4 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                              selectedBrands.includes(brand.id)
                                ? "border-brand bg-brand-soft"
                                : "border-line hover:border-ink-2"
                            }`}
                          >
                            {brand.image ? (
                              <img
                                src={brand.image}
                                alt={brand.name}
                                className="mb-2 h-10 w-auto object-contain"
                              />
                            ) : Icon ? (
                              <Icon className="mb-2 h-10 w-auto" />
                            ) : (
                              <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-brand font-bold">
                                {brand.name.charAt(0)}
                              </div>
                            )}
                            <div className="text-sm font-semibold">{brand.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Working Hours */}
                {section.id === "workingHours" && (
                  <div className="space-y-4">
                    {days.map((day) => (
                      <div key={day} className="grid grid-cols-3 gap-4 items-center">
                        <span className="font-medium capitalize">{day}</span>
                        <input
                          type="text"
                          value={workingHours[day].open}
                          onChange={(e) => setWorkingHours({ ...workingHours, [day]: { ...workingHours[day], open: e.target.value } })}
                          className="px-4 py-2 rounded-xl border border-line focus:border-ink outline-none"
                        />
                        <input
                          type="text"
                          value={workingHours[day].close}
                          onChange={(e) => setWorkingHours({ ...workingHours, [day]: { ...workingHours[day], close: e.target.value } })}
                          className="px-4 py-2 rounded-xl border border-line focus:border-ink outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Mechanics */}
                {section.id === "mechanics" && (
                  <div className="space-y-4">
                    {mechanics.map((mechanic) => (
                      <div key={mechanic.id} className="flex items-center justify-between p-4 bg-bg-soft rounded-xl">
                        <div>
                          <p className="font-semibold">{mechanic.name}</p>
                          <p className="text-muted text-sm">{mechanic.phone}</p>
                        </div>
                        <button
                          onClick={() => removeMechanic(mechanic.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Mechanic name"
                        value={newMechanic.name}
                        onChange={(e) => setNewMechanic({ ...newMechanic, name: e.target.value })}
                        className="px-4 py-2 rounded-xl border border-line focus:border-ink outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Phone number"
                        value={newMechanic.phone}
                        onChange={(e) => setNewMechanic({ ...newMechanic, phone: e.target.value })}
                        className="px-4 py-2 rounded-xl border border-line focus:border-ink outline-none"
                      />
                      <button
                        onClick={addMechanic}
                        className="btn-primary flex items-center justify-center gap-2"
                      >
                        <FiPlus /> Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Documents */}
                {section.id === "documents" && (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-bg-soft rounded-xl">
                        <p className="font-semibold">{doc.name}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${doc.status === "Uploaded" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {doc.status}
                          </span>
                          <input
                            type="file"
                            id={`file-upload-${doc.id}`}
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setDocuments(documents.map(d =>
                                  d.id === doc.id ? { ...d, status: "Uploaded" } : d
                                ));
                              }
                            }}
                          />
                          <button
                            onClick={() => document.getElementById(`file-upload-${doc.id}`).click()}
                            className="btn-ghost text-sm py-1 px-3"
                          >
                            <FiUpload /> Upload
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Payment Details */}
                {section.id === "paymentDetails" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Bank Name</label>
                      <input
                        type="text"
                        value={paymentDetails.bankName}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors"
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Account Number</label>
                        <input
                          type="text"
                          value={paymentDetails.accountNumber}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors"
                          placeholder="Enter account number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">IFSC Code</label>
                        <input
                          type="text"
                          value={paymentDetails.ifscCode}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, ifscCode: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors"
                          placeholder="Enter IFSC code"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">UPI ID</label>
                      <input
                        type="text"
                        value={paymentDetails.upiId}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors"
                        placeholder="Enter UPI ID"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
