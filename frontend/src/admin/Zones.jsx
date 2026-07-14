import React, { useEffect, useState } from "react";
import { zoneApi } from "../api/zoneApi";
import { AdminNavbar } from "./Dashboard";
import CrudTable from "./CrudTable";

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const data = await zoneApi.list();
      setZones(data);
    } catch (err) {
      console.error("Failed to load zones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleSave = async (formData, id) => {
    try {
      if (id) {
        await zoneApi.update(id, formData);
      } else {
        await zoneApi.create(formData);
      }
      await fetchZones();
    } catch (err) {
      throw new Error(err.response?.data?.detail || "Failed to save zone.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await zoneApi.delete(id);
      await fetchZones();
    } catch (err) {
      throw new Error(err.response?.data?.detail || "Failed to delete zone.");
    }
  };

  const fields = [
    { name: "name", label: "Zone Name", type: "text", required: true, placeholder: "e.g. North Zone" },
    { name: "description", label: "Description", type: "textarea", required: false, placeholder: "Details..." },
    { name: "is_active", label: "Active Status", type: "checkbox", defaultValue: true },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col md:flex-row">
      <AdminNavbar activeTab="zones" />
      <div className="flex-1 p-8">
        <CrudTable
          title="Zone"
          fields={fields}
          data={zones}
          onSave={handleSave}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Zones;
