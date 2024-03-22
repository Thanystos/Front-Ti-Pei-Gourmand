import React from 'react';
import { propTypes } from 'prop-types';
import { Spinner } from 'react-bootstrap';
import SpinnerWrapperStyled from '../../utils/style/atoms';

// Mon composant représentant le spinner qui s'affiche en fonction de sa prop.
// le '$' est important car la props va être utilisé dans un styled-component
const SpinnerWrapper = React.memo(({ $showSpinner }) => {
  console.log('showspinner : ', $showSpinner);
  return (
    <SpinnerWrapperStyled $visible={$showSpinner}>
      <Spinner animation="border text-primary" role="status" />
    </SpinnerWrapperStyled>
  );
});

SpinnerWrapper.propTypes = {
  $showSpinner: propTypes.func.isRequired,
};

export default SpinnerWrapper;
