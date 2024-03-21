import React from 'react';
import NavBar from '../NavBar';

const MainPanel = ({ children }) => {
  return(
    <div className='content'>
      <NavBar />
      {children}
    </div>
  );
};

export default MainPanel;