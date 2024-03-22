import React, { useState } from 'react';
import GenericTable from '../../Generic/GenericTable';

function UserTable() {
  // State permettant de définir les informations des Users à afficher
  const [displayedColumns, setDisplayedColumns] = useState({
    username: true,
    roles: true,
    phoneNumber: false,
    email: false,
    hireDate: true,
    endDate: false,
    employmentStatus: false,
    socialSecurityNumber: false,
    comments: false,
  });

  return (
    <GenericTable name="users" displayedColumns={displayedColumns} setDisplayedColumns={setDisplayedColumns} />
  );
}

export default UserTable;
