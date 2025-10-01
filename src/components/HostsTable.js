import React, { useState, useEffect } from 'react';

const HostsTable = ({ leases, hosts, onChange }) => {
  const [newHosts, setNewHosts] = useState([]);
  const [newLeaseId, setNewLeaseId] = useState('');

  useEffect(() => {
    setNewHosts(hosts);
  }, [hosts]);

  const handleInputChange = (index, field, value) => {
    const newData = [...newHosts];
    newData[index][field] = value;
    setNewHosts(newData);
  };

  const addRow = () => {
    let newRow = {
      mac: '',
      ip: '',
      hostname: '',
      leaseTime: '1h'
    }
    if (newLeaseId !== '') {
      let newLease = leases[newLeaseId]
      newRow = {
        ...newRow,
        mac: newLease.mac,
        ip: newLease.ip,
        hostname: newLease.hostname        
      }
    }
    setNewHosts([...newHosts, newRow ]);
  };

  const removeRow = (index) => {
    const newData = newHosts.filter((_, i) => i !== index);
    setNewHosts(newData);
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
          {newHosts.map((item, index) => (
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

      <div>
        <select onChange={(e) => setNewLeaseId(e.target.value)} >
          <option value="">Empty</option>
          {leases.map((item,i) => 
              (<option key={i} value={i}>{`${item.mac} / ${item.ip} / ${item.hostname}`}</option>)
          )}          
        </select>
        <button onClick={addRow} style={{ marginTop: '10px' }}>Add</button>
      </div>
      
      {/* Optional: Display current data for debugging
      <pre style={{ marginTop: '20px' }}>{JSON.stringify(data, null, 2)}</pre>
       */}
    </div>
  );
};

export default HostsTable;