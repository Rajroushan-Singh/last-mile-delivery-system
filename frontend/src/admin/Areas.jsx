import React, { useEffect, useState } from "react";
import { areaApi } from "../api/areaApi";
import { zoneApi } from "../api/zoneApi";
import { AdminNavbar } from "./Dashboard";
import CrudTable from "./CrudTable";

const Areas = () => {
  const [areas, setAreas] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [areasData, zonesData] = await Promise.all([
        areaApi.list(),
        zoneApi.list(),
      ]);
      setAreas(areasData);
      setZones(zonesData);
    } catch (err) {
      console.error("Failed to load areas or zones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSave = async (formData, id) => {
    // Parse zone to integer
    const payload = {
      ...formData,
      zone: parseInt(formData.zone),
    };
    try {
      if (id) {
        await areaApi.update(id, payload);
      } else {
        await areaApi.create(payload);
      }
      await fetchInitialData();
    } catch (err) {
      throw new Error(err.response?.data?.detail || "Failed to save area.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await areaApi.delete(id);
      await fetchInitialData();
    } catch (err) {
      throw new Error(err.response?.data?.detail || "Failed to delete area.");
    }
  };

  // Build zoneMap for the CrudTable display
  const zoneMap = {};
  zones.forEach((z) => {
    zoneMap[z.id] = z.name;
  });

  const fields = [
    {
      name: "zone",
      label: "Zone",
      type: "select",
      required: true,
      options: zones.map((z) => ({ value: z.id.toString(), label: z.name })),
    },
    { name: "name", label: "Area Name", type: "text", required: true, placeholder: "e.g. Kothrud" },
    { name: "pincode", label: "Pincode", type: "text", required: true, placeholder: "e.g. 411038" },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col md:flex-row">
      <AdminNavbar activeTab="areas" />
      <div className="flex-1 p-8">
        <CrudTable
          title="Area"
          fields={fields}
          data={areas}
          onSave={handleSave}
          onDelete={handleDelete}
          loading={loading}
          zoneMap={zoneMap}
        />
      </div>
    </div>
  );
};

export default Areas;
