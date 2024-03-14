import React from 'react';
import { Spinner } from 'react-bootstrap';
import { SpinnerWrapperStyled } from '../../utils/style/atoms';

// Mon composant représentant le spinner qui s'affiche en fonction de sa prop.
// le '$' est important car la props va être utilisé dans un styled-component
const SpinnerWrapper = ({ $showSpinner }) => {
console.log('showspinner : ', $showSpinner);
  return (
    <SpinnerWrapperStyled $visible={$showSpinner}>
      <Spinner animation="border text-primary" role="status" />
    </SpinnerWrapperStyled>
  );
};

export default SpinnerWrapper;
