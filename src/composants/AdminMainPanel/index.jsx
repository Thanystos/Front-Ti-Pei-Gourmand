// MainPanel.jsx
import React from 'react';
import styled from 'styled-components';

const PanelContainer = styled.div`
  flex: 1;
  padding: 20px;
  height: 100vh;
`;

const AdminMainPanel = ({ children }) => {
  return <PanelContainer>{children}</PanelContainer>;
};

export default AdminMainPanel;
