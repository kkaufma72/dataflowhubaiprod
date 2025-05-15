import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore'; // or 'firebase/database'

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase; // Export if you need to use it in other files
import React from 'react';

interface CRMEntry {
  id: string; // Assuming id is always present
  name: string;
  // Add other CRM data fields
  email: string;
  industry: string;
  status: string;
  // Add other fields as needed based on your CRM data
  [key: string]: any; // Allow any other properties

}

interface DataTableProps {
  data: CRMEntry[];
  onRowClick: (entry: CRMEntry) => void;
  onEditClick: (entry: CRMEntry) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, onRowClick, onEditClick }) => {
  if (!data || data.length === 0) {
    return <p>No data available.</p>;
  }

  // Define the headers we want to display
  const headers = ['name', 'email', 'industry', 'status'];

  return (
    <table>
      <thead>
        <tr>
          {/* Render headers based on the defined headers array */}
          {headers.map(headerKey => (
            <th key={headerKey}>{headerKey.charAt(0).toUpperCase() + headerKey.slice(1)}</th> // Capitalize header names
          ))}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(entry => (
          <tr key={entry.id} onClick={() => onRowClick(entry)}>
            {/* Render data for the defined headers */}
            {headers.map(headerKey => (
              <td key={`${entry.id}-${headerKey}`}>{entry[headerKey]}</td>
            ))}
            <td>
              <button onClick={(e) => {
                e.stopPropagation(); // Prevent row click when button is clicked
                onEditClick(entry);
              }}>
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;