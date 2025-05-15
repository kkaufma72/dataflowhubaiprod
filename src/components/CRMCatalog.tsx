import React, { useState, useEffect } from 'react';
import DataSearchBar from './DataSearchBar';
import DataFilter from './DataFilter';
import DataTable from './DataTable';
import DataDetailsPanel from './DataDetailsPanel';
import DataEditModal from './DataEditModal';

interface CRMEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const CRMCatalog: React.FC = () => {
  const [crmData, setCrmData] = useState<CRMEntry[]>([]);
  const [filteredData, setFilteredData] = useState<CRMEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<any>({}); // Define a proper type for filters later
  const [selectedEntry, setSelectedEntry] = useState<CRMEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Fetch data from the backend here later
  useEffect(() => {
    // Placeholder data
    const dummyData: CRMEntry[] = [
      { id: '1', name: 'Company A', email: 'a@example.com', phone: '111-111-1111', address: '123 Main St', industry: 'Tech', status: 'Active', created_at: '2023-01-01', updated_at: '2023-01-15' },
      { id: '2', name: 'Company B', email: 'b@example.com', phone: '222-222-2222', address: '456 Oak Ave', industry: 'Finance', status: 'Inactive', created_at: '2023-02-01', updated_at: '2023-02-10' },
      { id: '3', name: 'Company C', email: 'c@example.com', phone: '333-333-3333', address: '789 Pine Ln', industry: 'Healthcare', status: 'Active', created_at: '2023-03-01', updated_at: '2023-03-20' },
      // Add more dummy data
    ];
    setCrmData(dummyData);
    setFilteredData(dummyData);
  }, []);

  // Implement search and filter logic here later
  useEffect(() => {
    let data = crmData;

    // Apply search
    if (searchTerm) {
      data = data.filter(entry =>
        Object.values(entry).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    data = data.filter(entry => {
      for (const key in filters) {
        if (filters[key] && entry[key as keyof CRMEntry] !== filters[key]) {
          return false;
        }
      }
      return true;
    });


    setFilteredData(data);
  }, [crmData, searchTerm, filters]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleRowClick = (entry: CRMEntry) => {
    setSelectedEntry(entry);
  };

  const handleEditClick = (entry: CRMEntry) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEntry(null);
  };

  const handleSaveEdit = (updatedEntry: CRMEntry) => {
    // Implement logic to save changes to the backend
    console.log('Saving changes:', updatedEntry);
    // For now, update the local state with the edited entry
    setCrmData(prevData =>
      prevData.map(entry => (entry.id === updatedEntry.id ? updatedEntry : entry))
    );
    setIsEditModalOpen(false);
    setSelectedEntry(null);
  };

  return (
    <div className="crm-catalog-container">
      <h1 className="crm-catalog-title">CRM Data Catalog</h1>
      <div className="crm-catalog-controls">
        <DataSearchBar onSearch={handleSearch} />
        <DataFilter onFilter={handleFilter} />
      </div>
      <div className="crm-catalog-table-container">
        <DataTable data={filteredData} onRowClick={handleRowClick} onEditClick={handleEditClick} />
      </div>

      {selectedEntry && !isEditModalOpen && (
        <div className="crm-catalog-details-panel">
          <DataDetailsPanel entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        </div>
      )}

      {isEditModalOpen && selectedEntry && (
        <div className="crm-catalog-edit-modal">
          <DataEditModal
            entry={selectedEntry}
            onClose={handleCloseEditModal}
            onSave={handleSaveEdit}
          />
        </div>
      )}
    </div>
  );
};

export default CRMCatalog;