import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/api/admin";
import { FiCheck, FiEdit3, FiRefreshCw, FiTrash2, FiX } from "react-icons/fi";

const applicationStatuses = ["PENDING", "CHANGES_REQUESTED", "APPROVED", "DENIED"];

const money = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

export default function Garages() {
  const [tab, setTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState("PENDING");
  const [garages, setGarages] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedGarageId, setSelectedGarageId] = useState("");
  const [serviceForm, setServiceForm] = useState({ serviceId: "", price: "", duration: "" });
  const [noteByApplication, setNoteByApplication] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedGarage = useMemo(
    () => garages.find((garage) => garage.id === selectedGarageId) || null,
    [garages, selectedGarageId]
  );

  const loadApplications = async () => {
    setLoading(true);
    setError("");
    try {
      setApplications(await adminApi.getApplications(applicationStatus));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load applications");
    } finally {
      setLoading(false);
    }
  };

  const loadGaragesAndServices = async () => {
    setLoading(true);
    setError("");
    try {
      const [garageList, serviceList] = await Promise.all([
        adminApi.getGarages(),
        adminApi.getAssignableServices(),
      ]);
      setGarages(garageList || []);
      setServices(serviceList || []);
      setSelectedGarageId((current) => current || garageList?.[0]?.id || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load garages/services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "applications") loadApplications();
    if (tab === "services") loadGaragesAndServices();
  }, [tab, applicationStatus]);

  const runApplicationAction = async (application, action) => {
    setError("");
    setSuccess("");
    const note = noteByApplication[application.id] || "";

    try {
      if (action === "approve") await adminApi.approveApplication(application.id, note);
      if (action === "changes") await adminApi.requestApplicationChanges(application.id, note);
      if (action === "deny") await adminApi.denyApplication(application.id, note);
      setSuccess(`Application ${action === "changes" ? "sent for changes" : `${action}d`}.`);
      await loadApplications();
    } catch (err) {
      setError(err.response?.data?.message || `Unable to ${action} application`);
    }
  };

  const saveGarageService = async (event) => {
    event.preventDefault();
    if (!selectedGarageId || !serviceForm.serviceId) return;

    setError("");
    setSuccess("");
    try {
      await adminApi.saveGarageService(selectedGarageId, {
        serviceId: serviceForm.serviceId,
        price: serviceForm.price,
        duration: serviceForm.duration,
        isActive: true,
      });
      setSuccess("Garage service saved.");
      setServiceForm({ serviceId: "", price: "", duration: "" });
      await loadGaragesAndServices();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save garage service");
    }
  };

  const removeGarageService = async (serviceId) => {
    setError("");
    setSuccess("");
    try {
      await adminApi.removeGarageService(selectedGarageId, serviceId);
      setSuccess("Garage service removed.");
      await loadGaragesAndServices();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to remove garage service");
    }
  };

  const editGarageService = (item) => {
    setServiceForm({
      serviceId: item.serviceId,
      price: item.price || "",
      duration: item.duration || "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Garages</h2>
          <p className="text-muted">Approve garage applications and assign services.</p>
        </div>
        <div className="flex gap-2 rounded-xl bg-bg-soft p-1">
          {[
            ["applications", "Applications"],
            ["services", "Services"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === id ? "bg-ink text-white" : "text-muted"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
      {success && <div className="rounded-xl bg-green-50 p-4 text-green-700">{success}</div>}

      {tab === "applications" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {applicationStatuses.map((status) => (
              <button
                key={status}
                onClick={() => setApplicationStatus(status)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${applicationStatus === status ? "bg-ink text-white" : "bg-bg-soft text-muted"}`}
              >
                {status.replaceAll("_", " ")}
              </button>
            ))}
            <button onClick={loadApplications} className="btn-ghost !py-2">
              <FiRefreshCw /> Refresh
            </button>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="card-soft p-5 text-muted">Loading applications...</div>
            ) : applications.length ? applications.map((application) => (
              <div key={application.id} className="card-soft p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-lg font-bold">{application.garageName}</h3>
                      <p className="text-sm text-muted">{application.ownerName} · {application.email} · {application.phone}</p>
                    </div>
                    <p className="text-sm">{application.address}, {application.area}, {application.city}</p>
                    <p className="text-sm text-muted">
                      Radius: {application.workingRadiusKm || 15} km ·
                      Lat/Lng: {application.latitude ?? "N/A"}, {application.longitude ?? "N/A"}
                    </p>
                    {application.description && <p className="whitespace-pre-wrap text-sm text-muted">{application.description}</p>}
                  </div>
                  <span className="chip-brand self-start">{application.status}</span>
                </div>

                {application.status !== "APPROVED" && application.status !== "DENIED" && (
                  <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
                    <input
                      value={noteByApplication[application.id] || ""}
                      onChange={(e) => setNoteByApplication({ ...noteByApplication, [application.id]: e.target.value })}
                      placeholder="Optional admin note"
                      className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => runApplicationAction(application, "approve")} className="btn-primary">
                        <FiCheck /> Approve
                      </button>
                      <button onClick={() => runApplicationAction(application, "changes")} className="btn-ghost">
                        <FiEdit3 /> Changes
                      </button>
                      <button onClick={() => runApplicationAction(application, "deny")} className="rounded-xl bg-red-700 px-4 py-3 font-semibold text-white">
                        <FiX /> Deny
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )) : (
              <div className="card-soft p-5 text-muted">No applications found.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
          <div className="card-soft overflow-hidden">
            <div className="border-b border-line p-4">
              <h3 className="font-bold">Select Garage</h3>
            </div>
            <div className="max-h-[680px] overflow-y-auto">
              {garages.map((garage) => (
                <button
                  key={garage.id}
                  onClick={() => setSelectedGarageId(garage.id)}
                  className={`block w-full border-b border-line p-4 text-left transition ${selectedGarageId === garage.id ? "bg-ink text-white" : "hover:bg-bg-soft"}`}
                >
                  <div className="font-semibold">{garage.name}</div>
                  <div className={`text-xs ${selectedGarageId === garage.id ? "text-white/70" : "text-muted"}`}>
                    {garage.city} · {garage.services?.length || 0} services · {garage.isActive ? "Active" : "Inactive"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="card-soft p-5">
              <h3 className="text-xl font-bold">{selectedGarage?.name || "Select a garage"}</h3>
              {selectedGarage && (
                <p className="text-sm text-muted">
                  {selectedGarage.address}, {selectedGarage.city} · Wallet {money(selectedGarage.wallet?.balance)}
                </p>
              )}
            </div>

            <form onSubmit={saveGarageService} className="card-soft grid gap-3 p-5 lg:grid-cols-[1fr_140px_140px_auto]">
              <select
                required
                value={serviceForm.serviceId}
                onChange={(e) => setServiceForm({ ...serviceForm, serviceId: e.target.value })}
                className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
              >
                <option value="">Select service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.category?.name ? `${service.category.name} - ` : ""}{service.name}
                  </option>
                ))}
              </select>
              <input
                value={serviceForm.price}
                onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                type="number"
                min="0"
                placeholder="Price"
                className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
              />
              <input
                value={serviceForm.duration}
                onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                type="number"
                min="0"
                placeholder="Minutes"
                className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
              />
              <button disabled={!selectedGarageId} className="btn-primary">Save</button>
            </form>

            <div className="card-soft overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-bg-soft text-left">
                  <tr>{["Service", "Category", "Price", "Duration", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {selectedGarage?.services?.length ? selectedGarage.services.map((item) => (
                    <tr key={item.id} className="border-t border-line">
                      <td className="px-4 py-3 font-medium">{item.service?.name}</td>
                      <td className="px-4 py-3">{item.service?.category?.name || "General"}</td>
                      <td className="px-4 py-3">{money(item.price || item.service?.basePrice)}</td>
                      <td className="px-4 py-3">{item.duration || item.service?.durationMin || "-"} min</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => editGarageService(item)} className="btn-ghost !px-3 !py-2" type="button"><FiEdit3 /></button>
                          <button onClick={() => removeGarageService(item.serviceId)} className="rounded-xl bg-red-50 px-3 py-2 text-red-700" type="button"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="px-4 py-5 text-muted">No services assigned yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
