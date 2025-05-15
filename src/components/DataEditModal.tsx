import React, { useState, useEffect } from 'react';

interface CRMEntry {
  id: string;
  name: string;
  // Add other CRM data fields you expect to edit
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  status?: string;
}

interface DataEditModalProps {
  entry: CRMEntry;
  onClose: () => void;
  onSave: (updatedEntry: CRMEntry) => void;
}

const DataEditModal: React.FC<DataEditModalProps> = ({ entry, onClose, onSave }) => {
  const [editedEntry, setEditedEntry] = useState<CRMEntry>(entry);

  useEffect(() => {
    setEditedEntry(entry);
  }, [entry]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedEntry(prevEntry => ({
      ...prevEntry,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(editedEntry);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit CRM Entry</h2>
        <form>
          <div>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={editedEntry.name}
              onChange={handleChange}
            />
          </div>
          {/* Add input fields for other editable CRM data fields */}
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={editedEntry.email || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="phone">Phone:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={editedEntry.phone || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="address">Address:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={editedEntry.address || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="industry">Industry:</label>
            <input
              type="text"
              id="industry"
              name="industry"
              value={editedEntry.industry || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="status">Status:</label>
            <input
              type="text"
              id="status"
              name="status"
              value={editedEntry.status || ''}
              onChange={handleChange}

            />
          </div>
          {/* End of additional fields */}
          <div className="modal-actions">
            <button type="button" onClick={handleSave}>Save</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DataEditModal;