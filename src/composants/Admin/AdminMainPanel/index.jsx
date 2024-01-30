import React from 'react';
import AdminNavBar from '../AdminNavBar';

const AdminMainPanel = ({ children }) => {
  return(
    <div className='content'>
      <AdminNavBar />
      {children}
    </div>
  );
};

export default AdminMainPanel;