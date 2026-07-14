import React, { useEffect, useState } from "react";
import { agentApi } from "../api/agentApi";
import { zoneApi } from "../api/zoneApi";
import { authApi } from "../api/authApi";
import { AdminNavbar } from "./Dashboard";
import CrudTable from "./CrudTable";

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [zones, setZones] = useState([]);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [allAgentUsers, setAllAgentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [agentsData, zonesData, eligibleUsersData, allAgentUsersData] = await Promise.all([
        agentApi.list(),
        zoneApi.list(),
        authApi.getUsers({ role: "DELIVERY_AGENT", eligible_only: "true" }),
        authApi.getUsers({ role: "DELIVERY_AGENT" }), // fetch all to show names in table
      ]);
      setAgents(agentsData);
      setZones(zonesData);
      setEligibleUsers(eligibleUsersData);
      setAllAgentUsers(allAgentUsersData);
    } catch (err) {
      console.error("Failed to load agent configuration data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSave = async (formData, id) => {
    const payload = {
      ...formData,
      user: parseInt(formData.user),
      current_zone: formData.current_zone ? parseInt(formData.current_zone) : null,
    };
    try {
      if (id) {
        // Exclude user key on edit since user is 1-to-1 and read-only
        const { user, ...updatePayload } = payload;
        await agentApi.update(id, { ...updatePayload, user: parseInt(formData.user) });
      } else {
        await agentApi.create(payload);
      }
      await fetchInitialData();
    } catch (err) {
      throw new Error(err.response?.data?.detail || "Failed to save agent.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await agentApi.delete(id);
      await fetchInitialData();
    } catch (err) {
      throw new Error(err.response?.data?.detail || "Failed to delete agent.");
    }
  };

  // Build maps for CrudTable renderer
  const zoneMap = {};
  zones.forEach((z) => {
    zoneMap[z.id] = z.name;
  });

  const userMap = {};
  allAgentUsers.forEach((u) => {
    userMap[u.id] = u.username;
  });

  // For the 'user' select option, if we are editing an agent we want to make sure the currently assigned user is in the options list
  const fields = [
    {
      name: "user",
      label: "User Account",
      type: "select",
      required: true,
      options: eligibleUsers.map((u) => ({ value: u.id.toString(), label: u.username })),
    },
    { name: "phone", label: "Phone Number", type: "text", required: true, placeholder: "e.g. 9876543210" },
    {
      name: "vehicle_type",
      label: "Vehicle Type",
      type: "select",
      required: true,
      options: [
        { value: "BIKE", label: "Bike" },
        { value: "SCOOTER", label: "Scooter" },
        { value: "VAN", label: "Van" },
      ],
    },
    {
      name: "current_zone",
      label: "Current Zone",
      type: "select",
      required: false,
      options: zones.map((z) => ({ value: z.id.toString(), label: z.name })),
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      defaultValue: "AVAILABLE",
      options: [
        { value: "AVAILABLE", label: "AVAILABLE" },
        { value: "BUSY", label: "BUSY" },
        { value: "OFFLINE", label: "OFFLINE" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col md:flex-row">
      <AdminNavbar activeTab="agents" />
      <div className="flex-1 p-8">
        <CrudTable
          title="Agent"
          fields={fields}
          data={agents}
          onSave={handleSave}
          onDelete={handleDelete}
          loading={loading}
          zoneMap={zoneMap}
          userMap={userMap}
        />
      </div>
    </div>
  );
};

export default Agents;
