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
  const [serviceForm, setServiceForm] = useState({ serviceId: "", price: "" });
  const [noteByApplication, setNoteByApplication] = useState({});
  const [selectedApplicationIds, setSelectedApplicationIds] = useState([]);
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
      setSelectedApplicationIds([]);
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
        isActive: true,
      });
      setSuccess("Garage service saved.");
      setServiceForm({ serviceId: "", price: "" });
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
    });
  };

  const toggleApplicationSelection = (applicationId) => {
    setSelectedApplicationIds((current) =>
      current.includes(applicationId)
        ? current.filter((id) => id !== applicationId)
        : [...current, applicationId]
    );
  };

  const deleteApplications = async (applicationIds) => {
    if (!applicationIds.length) return;
    setError("");
    setSuccess("");
    try {
      const result = await adminApi.deleteApplications(applicationIds);
      const deleted = result.deleted || applicationIds.length;
      setSuccess(`${deleted} application${deleted === 1 ? "" : "s"} deleted.`);
      await loadApplications();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete applications");
    }
  };

  const canDeleteApplications = applicationStatus === "APPROVED" || applicationStatus === "DENIED";
  const allApplicationIds = applications.map((application) => application.id);

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6 overflow-hidden">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Garages</h2>
          <p className="text-muted">Approve garage applications and assign services.</p>
        </div>
        <div className="flex w-full gap-2 rounded-xl bg-bg-soft p-1 sm:w-auto">
          {[
            ["applications", "Applications"],
            ["services", "Services"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold sm:flex-none ${tab === id ? "bg-ink text-white" : "text-muted"}`}
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
                className={`rounded-full px-4 py-2 text-xs font-semibold sm:text-sm ${applicationStatus === status ? "bg-ink text-white" : "bg-bg-soft text-muted"}`}
              >
                {status.replaceAll("_", " ")}
              </button>
            ))}
            <button onClick={loadApplications} className="btn-ghost !py-2 text-sm">
              <FiRefreshCw /> Refresh
            </button>
            {canDeleteApplications && applications.length > 0 && (
              <>
                <label className="inline-flex items-center gap-2 rounded-full bg-bg-soft px-4 py-2 text-xs font-semibold text-muted sm:text-sm">
                  <input
                    type="checkbox"
                    checked={selectedApplicationIds.length === applications.length}
                    onChange={(event) => setSelectedApplicationIds(event.target.checked ? allApplicationIds : [])}
                  />
                  Select all
                </label>
                <button
                  onClick={() => deleteApplications(selectedApplicationIds)}
                  disabled={!selectedApplicationIds.length}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 disabled:opacity-50 sm:text-sm"
                >
                  <FiTrash2 /> Delete selected
                </button>
                <button
                  onClick={() => deleteApplications(allApplicationIds)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-red-700 px-4 py-2 text-xs font-semibold text-white sm:text-sm"
                >
                  <FiTrash2 /> Delete all
                </button>
              </>
            )}
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="card-soft p-5 text-muted">Loading applications...</div>
            ) : applications.length ? applications.map((application) => (
              <div key={application.id} className="card-soft p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-2">
                    {canDeleteApplications && (
                      <label className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
                        <input
                          type="checkbox"
                          checked={selectedApplicationIds.includes(application.id)}
                          onChange={() => toggleApplicationSelection(application.id)}
                        />
                        Select
                      </label>
                    )}
                    <div>
                      <h3 className="text-lg font-bold">{application.garageName}</h3>
                      <p className="text-sm text-muted">{application.ownerName} · {application.email} · {application.phone}</p>
                    </div>
                    <p className="break-words text-sm">{application.address}, {application.area}, {application.city}</p>
                    <p className="text-sm text-muted">
                      Radius: {application.workingRadiusKm || 15} km ·
                      Lat/Lng: {application.latitude ?? "N/A"}, {application.longitude ?? "N/A"}
                    </p>
                    {application.description && <p className="whitespace-pre-wrap text-sm text-muted">{application.description}</p>}
                    {application.images?.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4 lg:grid-cols-6">
                        {application.images.map((image, index) => (
                          <a
                            key={image.id}
                            href={image.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block overflow-hidden rounded-xl border border-line bg-bg-soft"
                          >
                            <img
                              src={image.imageUrl}
                              alt={`${application.garageName} ${index + 1}`}
                              className="aspect-square w-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="chip-brand self-start">{application.status}</span>
                </div>

                {application.status !== "APPROVED" && application.status !== "DENIED" && (
                  <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(280px,1fr)_auto]">
                    <input
                      value={noteByApplication[application.id] || ""}
                      onChange={(e) => setNoteByApplication({ ...noteByApplication, [application.id]: e.target.value })}
                      placeholder="Optional admin note"
                      className="min-w-0 rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
                    />
                    <div className="flex flex-wrap gap-2 xl:flex-nowrap">
                      <button onClick={() => runApplicationAction(application, "approve")} className="btn-primary !px-4 !py-3 text-sm">
                        <FiCheck /> Approve
                      </button>
                      <button onClick={() => runApplicationAction(application, "changes")} className="btn-ghost !px-4 !py-3 text-sm">
                        <FiEdit3 /> Changes
                      </button>
                      <button onClick={() => runApplicationAction(application, "deny")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white">
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
        <div className="grid min-w-0 gap-5 2xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="card-soft min-w-0 overflow-hidden">
            <div className="border-b border-line p-4">
              <h3 className="font-bold">Select Garage</h3>
            </div>
            <div className="max-h-[420px] overflow-y-auto 2xl:max-h-[680px]">
              {garages.map((garage) => (
                <button
                  key={garage.id}
                  onClick={() => setSelectedGarageId(garage.id)}
                  className={`block w-full border-b border-line p-4 text-left transition ${selectedGarageId === garage.id ? "bg-ink text-white" : "hover:bg-bg-soft"}`}
                >
                  <div className="truncate font-semibold">{garage.name}</div>
                  <div className={`text-xs ${selectedGarageId === garage.id ? "text-white/70" : "text-muted"}`}>
                    {garage.city} · {garage.services?.length || 0} services · {garage.isActive ? "Active" : "Inactive"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0 space-y-5">
            <div className="card-soft p-5">
              <h3 className="text-xl font-bold">{selectedGarage?.name || "Select a garage"}</h3>
              {selectedGarage && (
                <p className="break-words text-sm text-muted">
                  {selectedGarage.address}, {selectedGarage.city} · Wallet {money(selectedGarage.wallet?.balance)}
                </p>
              )}
            </div>

            {selectedGarage && (
              <div className="card-soft space-y-3 p-5">
                <p className="whitespace-pre-wrap text-sm text-muted">
                  {selectedGarage.description || "No garage description submitted."}
                </p>
                <div className="grid gap-2 text-sm text-muted sm:grid-cols-2 lg:grid-cols-3">
                  <span>Owner: {selectedGarage.owner?.name || "N/A"}</span>
                  <span>Email: {selectedGarage.email || selectedGarage.owner?.email || "N/A"}</span>
                  <span>Phone: {selectedGarage.phone || selectedGarage.owner?.phone || "N/A"}</span>
                  <span>Area: {selectedGarage.area || "N/A"}</span>
                  <span>Radius: {selectedGarage.workingRadiusKm || 15} km</span>
                  <span>Lat/Lng: {selectedGarage.latitude ?? "N/A"}, {selectedGarage.longitude ?? "N/A"}</span>
                </div>
                {selectedGarage.images?.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {selectedGarage.images.map((image, index) => (
                      <a
                        key={image.id}
                        href={image.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-xl border border-line bg-bg-soft"
                      >
                        <img
                          src={image.imageUrl}
                          alt={`${selectedGarage.name} ${index + 1}`}
                          className="aspect-square w-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={saveGarageService} className="card-soft grid min-w-0 gap-3 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_150px_auto]">
              <select
                required
                value={serviceForm.serviceId}
                onChange={(e) => setServiceForm({ ...serviceForm, serviceId: e.target.value })}
                className="min-w-0 rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
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
                className="min-w-0 rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
              />
              <button disabled={!selectedGarageId} className="btn-primary !px-5">Save</button>
            </form>

            <div className="card-soft min-w-0 overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="bg-bg-soft text-left">
                  <tr>{["Service", "Category", "Price", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {selectedGarage?.services?.length ? selectedGarage.services.map((item) => (
                    <tr key={item.id} className="border-t border-line">
                      <td className="px-4 py-3 font-medium">{item.service?.name}</td>
                      <td className="px-4 py-3">{item.service?.category?.name || "General"}</td>
                      <td className="px-4 py-3">{money(item.price || item.service?.basePrice)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => editGarageService(item)} className="btn-ghost !px-3 !py-2" type="button"><FiEdit3 /></button>
                          <button onClick={() => removeGarageService(item.serviceId)} className="rounded-xl bg-red-50 px-3 py-2 text-red-700" type="button"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="px-4 py-5 text-muted">No services assigned yet.</td></tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
