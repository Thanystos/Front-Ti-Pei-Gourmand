import React from 'react';
import { propTypes } from 'prop-types';
import NavBar from '../NavBar';

function MainPanel({ children }) {
  return (
    <div className="content">
      <NavBar />
      {children}
    </div>
  );
}

MainPanel.propTypes = {
  children: propTypes.node.isRequired,
};

export default MainPanel;
