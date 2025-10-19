import React, { useState, useEffect, useMemo } from 'react';
import {
  Button, TextInput, Toolbar,
  ToolbarContent, ToolbarItem, ActionList, ActionListItem,
  Bullseye, EmptyState, EmptyStateBody, Title
} from '@patternfly/react-core';
import { Table, Thead, Tbody, TableVariant, Tr, Td, Th } from '@patternfly/react-table';
import { EditIcon, TrashIcon, PlusIcon, SaveIcon, TimesIcon } from '@patternfly/react-icons';
import PfSelect from './ui/pfSelect';

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

  const addRow = (value) => {
    setNewLeaseId(value)
    let newRow = {
      mac: '',
      ip: '',
      hostname: '',
      leaseTime: '1h'
    };
    if (value !== '') {
      let newLease = leases[value];
      newRow = {
        ...newRow,
        mac: newLease.mac,
        ip: newLease.ip,
        hostname: newLease.hostname        
      };
    }
    const updatedHosts = [...newHosts, newRow];
    setNewHosts(updatedHosts);
    setEditingData(null);
    setEditingIndex(updatedHosts.length - 1);
    setNewLeaseId('');
  };

  const removeRow = (index) => {
    const newData = newHosts.filter((_, i) => i !== index);
    setNewHosts(newData);
    setEditingIndex(null);
    if (onChange) onChange(newData);
  };

  const cancelEditing = (index) => {
    let resetData = [...newHosts];
    if (editingData) {
      resetData[index] = { ...editingData };
    } else {
      resetData.splice(index, 1);
    }
    setNewHosts(resetData);
    setEditingIndex(null);
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditingData({ ...newHosts[index] });
  };

  const confirmEditing = () => {
    setEditingIndex(null);
    if (onChange) onChange(newHosts);
  };

  const isRowEditable = (index) => {
    return editingIndex === index;
  };

  const leasesOptions = useMemo(() => {
    let options = leases.map((item, i) => {
      let label = `${item.mac} (${item.ip})`
      if (item.hostname) {
        label += ` (${item.hostname})`
      }
      return { value: i, mac: item.mac, label }
    })
    let flt = options.filter((item) => newHosts.findIndex((h) => h.mac === item.mac) === -1);
    return [{ label: 'Create empty' }, ...flt]
  }, [newHosts, leases]);

  const columns = [
    { key: 'mac', title: 'MAC Address' },
    { key: 'ip', title: 'IP Address' },
    { key: 'hostname', title: 'Hostname' },
    { key: 'leaseTime', title: 'Lease Time' },
    { key: 'actions', title: 'Actions' }
  ];

  return (
    <div>
      <Table
        variant={TableVariant.compact}
        aria-label="Hosts table"
      >
        <Thead>
          <Tr>
            {columns.map(column => (
              <Th key={column.key} sort={column.transforms}>
                {column.title}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {newHosts.length === 0 ? (
            <Tr>
              <Td colSpan={columns.length}>
                <Bullseye>
                  <EmptyState icon={PlusIcon}>
                    <Title headingLevel="h4" size="lg">
                      No hosts configured
                    </Title>
                    <EmptyStateBody>
                      Add a new host to get started.
                    </EmptyStateBody>
                  </EmptyState>
                </Bullseye>
              </Td>
            </Tr>
          ) : (
            newHosts.map((item, index) => (
              (isRowEditable(index)) ? (
                <Tr key={index}>
                  <Td>
                    <TextInput
                      value={item.mac}
                      onChange={(value) => handleInputChange(index, 'mac', value)}
                      placeholder="aa:bb:cc:dd:ee:ff"
                      aria-label={`MAC address for row ${index + 1}`}
                    />
                  </Td>
                  <Td>
                    <TextInput
                      value={item.ip}
                      onChange={(value) => handleInputChange(index, 'ip', value)}
                      placeholder="192.168.0.0"
                      aria-label={`IP address for row ${index + 1}`}
                    />
                  </Td>
                  <Td>
                    <TextInput
                      value={item.hostname}
                      onChange={(value) => handleInputChange(index, 'hostname', value)}
                      placeholder="hostname"
                      aria-label={`Hostname for row ${index + 1}`}
                    />
                  </Td>
                  <Td>
                    <TextInput
                      value={item.leaseTime}
                      onChange={(value) => handleInputChange(index, 'leaseTime', value)}
                      placeholder="infinite"
                      aria-label={`Lease time for row ${index + 1}`}
                    />
                  </Td>
                  <Td style={{ textAlign:'right', width:'250px' }}>
                        <Button
                          variant="link"
                          onClick={() => cancelEditing(index)}
                          icon={<TimesIcon />}
                          aria-label="Cancel editing"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={confirmEditing}
                          icon={<SaveIcon />}
                          aria-label="Save changes"
                        >
                          Save
                        </Button>
                  </Td>
                </Tr>
              ) : (
                <Tr key={index}>
                  <Td>
                    {item.mac}
                  </Td>
                  <Td>
                    {item.ip}
                  </Td>
                  <Td>
                    {item.hostname}
                  </Td>
                  <Td>
                    {item.leaseTime}
                  </Td>
                  <Td style={{ textAlign:'right' }}>
                    <Button
                      variant="link" size="sm"
                      onClick={() => startEditing(index)}
                      icon={<EditIcon />}
                      aria-label="Edit row"
                    >
                      Edit
                    </Button> 
                    <Button
                      variant="link" isDanger size="sm"
                      onClick={() => removeRow(index)}
                      icon={<TrashIcon />}
                      aria-label="Remove row"
                    >
                      Remove
                    </Button> 
                  </Td>
                </Tr>
              )              
            ))
          )}
          {editingIndex === null && (
            <Tr>
              <Td colSpan={4}>
                <PfSelect 
                  placeholder="Pre-fill with lease"
                  options={leasesOptions}
                  onChange={(value) => addRow(value)}
                  />
              </Td>
              {/*
              <Td>
                <Button
                  variant="primary"
                  onClick={addRow}
                  icon={<PlusIcon />}
                  aria-label="Add new host"
                >
                  Add Host
                </Button>              
              </Td>
              */}          
            </Tr>
          )}          
        </Tbody>
      </Table>
    </div>
  );
};

export default HostsTable;