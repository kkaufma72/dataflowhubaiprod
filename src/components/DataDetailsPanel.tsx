import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore'; // or 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyCrunIMcolSduTDt1fvBoeU0ehhh-EZYdM",
  authDomain: "dataflowhub-ai.firebaseapp.com",
  projectId: "dataflowhub-ai",
  storageBucket: "dataflowhub-ai.firebasestorage.app",
  messagingSenderId: "644231762271",
  appId: "1:644231762271:web:c386ea3b831686c827a6ea",
  measurementId: "G-ZGHM861CF6"  s
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase; // Export if you need to use it in other files
import React from 'react';

interface CRMEntry {
  id: string;
  id: string;
  name: string;
  // Add other CRM data fields
  email: string;
  phone: string;
  address: string;
  industry: string;
  status: string;
  [key: string]: any; // Allow for flexible properties
}

interface DataDetailsPanelProps {
  entry: CRMEntry;
  onClose: () => void;
}

const DataDetailsPanel: React.FC<DataDetailsPanelProps> = ({ entry, onClose }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px', position: 'relative' }}>
      <h2>Entry Details</h2>
      <div>
        <p><strong>ID:</strong> {entry.id}</p>
        <p><strong>Name:</strong> {entry.name}</p>
        <p><strong>Email:</strong> {entry.email}</p>
        <p><strong>Phone:</strong> {entry.phone}</p>
        <p><strong>Address:</strong> {entry.address}</p>
        <p><strong>Industry:</strong> {entry.industry}</p>
        <p><strong>Status:</strong> {entry.status}</p>
        {/* Add other fields here */}
      </div>

      {/* Close button positioned at the top right */}
      <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px' }}>
      ))}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default DataDetailsPanel;