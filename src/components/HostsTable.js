import React, { useState } from 'react';

const HostsTable = () => {
  const [data, setData] = useState([
    {
      "mac": "aa:bb:cc:dd:ee:ff",
      "ip": "192.168.10.50",
      "hostname": "office-printer",
      "leaseTime": "infinite"
    },
    {
      "mac": "11:22:33:44:55:66",
      "ip": "192.168.10.51",
      "hostname": "server",
      "leaseTime": "24h"
    }
  ]);

  const handleInputChange = (index, field, value) => {
    const newData = [...data];
    newData[index][field] = value;
    setData(newData);
  };

  const addRow = () => {
    setData([...data, {
      mac: '',
      ip: '',
      hostname: '',
      leaseTime: ''
    }]);
  };

  const removeRow = (index) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  return (
    <div>
      <table border="1">
        <thead>
          <tr>
            <th>MAC Address</th>
            <th>IP Address</th>
            <th>Hostname</th>
            <th>Lease Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  value={item.mac}
                  onChange={(e) => handleInputChange(index, 'mac', e.target.value)}
                  placeholder="aa:bb:cc:dd:ee:ff"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={item.ip}
                  onChange={(e) => handleInputChange(index, 'ip', e.target.value)}
                  placeholder="192.168.10.50"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={item.hostname}
                  onChange={(e) => handleInputChange(index, 'hostname', e.target.value)}
                  placeholder="office-printer"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={item.leaseTime}
                  onChange={(e) => handleInputChange(index, 'leaseTime', e.target.value)}
                  placeholder="infinite"
                />
              </td>
              <td>
                <button onClick={() => removeRow(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow} style={{ marginTop: '10px' }}>Add Row</button>
      
      {/* Optional: Display current data for debugging */}
      <pre style={{ marginTop: '20px' }}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default HostsTable;