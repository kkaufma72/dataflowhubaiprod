import React, { useState } from 'react';

interface DataFilterProps {
  onFilter: (filters: any) => void; // Define a more specific type for filters later
}

const DataFilter: React.FC<DataFilterProps> = ({ onFilter }) => {
  const [industryFilter, setIndustryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const handleIndustryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setIndustryFilter(value);
    onFilter({ industry: value, status: statusFilter });
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setStatusFilter(value);
    onFilter({ industry: industryFilter, status: value });
  };

  return (
    <div className="data-filter">
      <label htmlFor="industry-filter">Industry:</label>
      <select id="industry-filter" value={industryFilter} onChange={handleIndustryChange}>
        <option value="">All Industries</option>
        <option value="tech">Technology</option>
        <option value="finance">Finance</option>
        <option value="healthcare">Healthcare</option>
      </select>

      <label htmlFor="status-filter">Status:</label>
      <select id="status-filter" value={statusFilter} onChange={handleStatusChange}>
        <option value="">All Statuses</option>
        <option value="lead">Lead</option>
        <option value="lead">Lead</option>
        <option value="closed">Closed</option>
      </select>
    </div>
  );
};

export default DataFilter;