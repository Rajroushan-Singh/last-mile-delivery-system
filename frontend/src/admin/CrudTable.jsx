import React, { useState } from "react";
import { Plus, Edit2, Trash2, Search, X, Loader2 } from "lucide-react";

const CrudTable = ({
  title,
  fields,
  data,
  onSave,
  onDelete,
  loading,
  zoneMap = {}, // Optional: zone ID -> name mapping for prettier rendering
  userMap = {}, // Optional: user ID -> name mapping for prettier rendering
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleOpenCreate = () => {
    setEditingRecord(null);
    const initialData = {};
    fields.forEach((field) => {
      initialData[field.name] = field.defaultValue ?? "";
    });
    setFormData(initialData);
    setFormError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    const editData = {};
    fields.forEach((field) => {
      editData[field.name] = record[field.name] ?? "";
    });
    setFormData(editData);
    setFormError("");
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await onSave(formData, editingRecord?.id);
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message || "Failed to save record.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await onDelete(id);
      } catch (err) {
        alert(err.message || "Failed to delete record.");
      }
    }
  };

  const filteredData = data.filter((record) => {
    return fields.some((field) => {
      const val = record[field.name];
      if (val === undefined || val === null) return false;
      return val.toString().toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  const getDisplayValue = (field, record) => {
    const value = record[field.name];
    if (field.name === "zone" || field.name === "current_zone") {
      return zoneMap[value] || `Zone #${value}`;
    }
    if (field.name === "user") {
      return userMap[value] || `User #${value}`;
    }
    if (typeof value === "boolean") {
      return value ? (
        <span className="text-green-400 font-bold">Active</span>
      ) : (
        <span className="text-gray-500">Inactive</span>
      );
    }
    return value?.toString() || "-";
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-white">{title} Management</h3>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-1.5 bg-blue-650 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add New</span>
        </button>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center gap-3">
        <Search className="h-5 w-5 text-gray-500" />
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder-gray-550"
        />
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-16 glass-panel border-gray-800 rounded-xl text-gray-500">
          No records found.
        </div>
      ) : (
        <div className="glass-panel border-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/30 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {fields.map((field) => (
                    <th key={field.name} className="p-4">{field.label}</th>
                  ))}
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {filteredData.map((record) => (
                  <tr key={record.id} className="text-sm hover:bg-gray-800/10 transition">
                    {fields.map((field) => (
                      <td key={field.name} className="p-4 text-gray-300">
                        {getDisplayValue(field, record)}
                      </td>
                    ))}
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(record)}
                        className="p-1.5 bg-gray-850 hover:bg-gray-800 text-gray-300 rounded hover:text-white transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(record.id)}
                        className="p-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-400 rounded hover:text-red-300 transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pop-up Edit/Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
              <h4 className="text-lg font-bold text-white">
                {editingRecord ? `Edit ${title}` : `Create ${title}`}
              </h4>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {formError && (
                  <div className="rounded bg-red-900/30 border border-red-500/20 p-3 text-xs text-red-400">
                    {formError}
                  </div>
                )}

                {fields.map((field) => {
                  if (field.name === "user" && editingRecord) {
                    // Make user field read-only during edit since user mapping is 1-to-1 and shouldn't change
                    return (
                      <div key={field.name}>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          {field.label}
                        </label>
                        <div className="mt-1.5 py-2 px-3 bg-gray-850 rounded text-sm text-gray-400 border border-gray-800 font-mono">
                          {userMap[editingRecord[field.name]] || `User #${editingRecord[field.name]}`}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={field.name}>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {field.label}
                      </label>
                      {field.type === "select" ? (
                        <select
                          name={field.name}
                          required={field.required}
                          value={formData[field.name] || ""}
                          onChange={handleInputChange}
                          className="w-full mt-1.5 py-2 px-3 glass-input bg-gray-900 text-sm cursor-pointer"
                        >
                          <option value="">Select option...</option>
                          {field.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "checkbox" ? (
                        <div className="flex items-center gap-2 mt-1.5">
                          <input
                            type="checkbox"
                            name={field.name}
                            checked={!!formData[field.name]}
                            onChange={handleInputChange}
                            className="h-4 w-4 rounded border-gray-800 text-blue-600 focus:ring-blue-500 bg-gray-900 cursor-pointer"
                          />
                          <span className="text-sm text-gray-300">Is Active</span>
                        </div>
                      ) : field.type === "textarea" ? (
                        <textarea
                          name={field.name}
                          required={field.required}
                          rows={2}
                          value={formData[field.name] || ""}
                          onChange={handleInputChange}
                          placeholder={field.placeholder}
                          className="w-full mt-1.5 py-2 px-3 glass-input text-sm"
                        />
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          required={field.required}
                          step="any"
                          value={formData[field.name] || ""}
                          onChange={handleInputChange}
                          placeholder={field.placeholder}
                          className="w-full mt-1.5 py-2 px-3 glass-input text-sm"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-800 px-6 py-4 bg-gray-900">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-gray-800 hover:bg-gray-750 text-gray-300 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudTable;
