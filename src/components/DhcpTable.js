import React from 'react';

const DhcpTable = ({ data }) => {
  // Function to format timestamp to readable date
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Function to display status with color coding
  const renderStatus = (isActive) => {
    return (
      <span
        style={{
          color: isActive ? 'green' : 'red',
          fontWeight: 'bold'
        }}
      >
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th>Expiry Date</th>
            <th>Status</th>
            <th>MAC Address</th>
            <th>IP Address</th>
            <th>Hostname</th>
            <th>Client ID</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              style={{
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                borderBottom: '1px solid #ddd'
              }}
            >
              <td >{formatTimestamp(item.timestamp)}</td>
              <td >{renderStatus(item.isActive)}</td>
              <td >{item.mac}</td>
              <td >{item.ip}</td>
              <td >{item.hostname}</td>
              <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                {item.clientId}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DhcpTable;