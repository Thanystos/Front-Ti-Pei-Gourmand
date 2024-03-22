import styled from 'styled-components';

// Le spinner s'affiche en fonction de l'état de la prop $visible
const SpinnerWrapperStyled = styled.div`
  position: fixed;
    top: 50%;
    left: 50%;
  transform: translate(-50%, -50%);
  width: 100vw;
  height: 100vh;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $visible }) => ($visible ? '1' : '0')};
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
  transition: opacity .5s ease-out, visibility 0s linear .5s;
  z-index: 99999;
`;

export default SpinnerWrapperStyled;
