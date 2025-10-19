import React from 'react';
import {
  Button, TextInput, Toolbar,
  ToolbarContent, ToolbarItem, ActionList, ActionListItem,
  Bullseye, EmptyState, EmptyStateBody, Title
} from '@patternfly/react-core';
import { Table, Thead, Tbody, TableVariant, Tr, Td, Th } from '@patternfly/react-table';
import { EditIcon, TrashIcon, PlusIcon, SaveIcon, TimesIcon } from '@patternfly/react-icons';

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


  const removeRow = (index) => {
    alert('removeRow '+index)
  };  

  return (
    <div>
      <Table
        variant={TableVariant.compact}
        aria-label="Dhcp leases table"
      >
        <Thead>
          <Tr>
            <Th>Expiry Date</Th>
            <Th>Status</Th>
            <Th>MAC Address</Th>
            <Th>IP Address</Th>
            <Th>Hostname</Th>
            {/*<Th>Client ID</Th>*/}
            <Th style={{ width:'150px' }}></Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((item, index) => (
            <Tr key={index}>
              <Td>{formatTimestamp(item.timestamp)}</Td>
              <Td>{renderStatus(item.isActive)}</Td>
              <Td>{item.mac}</Td>
              <Td>{item.ip}</Td>
              <Td>{item.hostname}</Td>
              {/*<Tdstyle={{ fontFamily: 'monospace', fontSize: '12px' }}>
                {item.clientId}
              </Td>*/}
              <Td style={{ textAlign:'right' }}>
                <Button
                  variant="link" isDanger
                  size="sm"
                  onClick={() => removeRow(index)}
                  icon={<TrashIcon />}
                  aria-label="Remove"
                >
                  Remove
                </Button>                
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
};

export default DhcpTable;