import React, { useEffect, useState } from "react";
import { ratecardApi } from "../api/ratecardApi";
import { AdminNavbar } from "./Dashboard";
import CrudTable from "./CrudTable";

const RateCards = () => {
  const [ratecards, setRatecards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRateCards = async () => {
    setLoading(true);
    try {
      const data = await ratecardApi.list();
      setRatecards(data);
    } catch (err) {
      console.error("Failed to load rate cards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRateCards();
  }, []);

  const handleSave = async (formData, id) => {
    // Format decimal fields
    const payload = {
      ...formData,
      intra_zone_rate: parseFloat(formData.intra_zone_rate).toFixed(2),
      inter_zone_rate: parseFloat(formData.inter_zone_rate).toFixed(2),
      cod_surcharge: parseFloat(formData.cod_surcharge).toFixed(2),
    };
    try {
      if (id) {
        await ratecardApi.update(id, payload);
      } else {
        await ratecardApi.create(payload);
      }
      await fetchRateCards();
    } catch (err) {
      throw new Error(err.response?.data?.detail || "Failed to save rate card.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await ratecardApi.delete(id);
      await fetchRateCards();
    } catch (err) {
      throw new Error(err.response?.data?.detail || "Failed to delete rate card.");
    }
  };

  const fields = [
    {
      name: "order_type",
      label: "Order Type",
      type: "select",
      required: true,
      options: [
        { value: "B2C", label: "B2C (Business to Customer)" },
        { value: "B2B", label: "B2B (Business to Business)" },
      ],
    },
    { name: "intra_zone_rate", label: "Intra-Zone Rate (₹)", type: "number", required: true, placeholder: "50.00" },
    { name: "inter_zone_rate", label: "Inter-Zone Rate (₹)", type: "number", required: true, placeholder: "80.00" },
    { name: "cod_surcharge", label: "COD Surcharge (₹)", type: "number", required: true, placeholder: "30.00" },
    { name: "is_active", label: "Active Status", type: "checkbox", defaultValue: true },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col md:flex-row">
      <AdminNavbar activeTab="ratecards" />
      <div className="flex-1 p-8">
        <CrudTable
          title="Rate Card"
          fields={fields}
          data={ratecards}
          onSave={handleSave}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default RateCards;
