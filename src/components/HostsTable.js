import React, { useState, useEffect, useMemo } from 'react';

const HostsTable = ({ leases, hosts, onChange }) => {
  const [newHosts, setNewHosts] = useState([]);
  const [newLeaseId, setNewLeaseId] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingData, setEditingData] = useState(null);

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
    const updatedHosts = [...newHosts, newRow];
    setNewHosts(updatedHosts);
    setEditingData(null)
    setEditingIndex(updatedHosts.length - 1);
  };

  const removeRow = (index) => {
    const newData = newHosts.filter((_, i) => i !== index);
    setNewHosts(newData);
    setEditingIndex(null);
    if (onChange) onChange(newData)
  }

  const cancelEditing = (index) => {
    let resetData = [...newHosts];
    if (editingData) {
      resetData[index] = { ...editingData };
    } else {
      resetData.splice(index, 1)
    }
    setNewHosts(resetData);
    setEditingIndex(null);
  }

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditingData({ ...newHosts[index] })
  }

  const confirmEditing = () => {
    setEditingIndex(null)
    console.log('onChange',onChange)
    if (onChange) onChange(newHosts)
  }

  const isRowEditable = (index) => {
    return editingIndex === index;
  }

  const filtredLeases = useMemo(() => {
    return leases.filter((item) => newHosts.findIndex((h) => h.mac === item.mac) === -1)
  }, [newHosts, leases]);  

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
                  disabled={!isRowEditable(index)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={item.ip}
                  onChange={(e) => handleInputChange(index, 'ip', e.target.value)}
                  placeholder="192.168.10.50"
                  disabled={!isRowEditable(index)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={item.hostname}
                  onChange={(e) => handleInputChange(index, 'hostname', e.target.value)}
                  placeholder="office-printer"
                  disabled={!isRowEditable(index)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={item.leaseTime}
                  onChange={(e) => handleInputChange(index, 'leaseTime', e.target.value)}
                  placeholder="infinite"
                  disabled={!isRowEditable(index)}
                />
              </td>
              <td>
                {isRowEditable(index) ? (
                  <>
                    <button onClick={confirmEditing}>Done</button>
                    <button onClick={() => cancelEditing(index)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(index)}>Edit</button>
                    <button onClick={() => removeRow(index)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {(editingIndex === null)? (
        <div>
          <select onChange={(e) => setNewLeaseId(e.target.value)} >
            <option value="">Empty</option>
            {filtredLeases.map((item,i) => 
                (<option key={i} value={i}>{`${item.mac} / ${item.ip} / ${item.hostname}`}</option>)
            )}          
          </select>
          <button onClick={addRow} style={{ marginTop: '10px' }}>Add</button>
        </div>
      ) : null}

    </div>
  );
};

export default HostsTable;