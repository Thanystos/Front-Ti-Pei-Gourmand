/* eslint-disable max-len */
import React, { useState } from 'react';
import { propTypes } from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { useApi, useModalManagement } from '../../../utils/hooks';
import SpinnerWrapper from '../../SpinnerWrapper';

function GenericDeleteModal({
  name, selectedEntries, setSelectedEntries, handleClose, handleSuccess,
}) {
  // Utilisation du hook useApiRequest
  const { errors, fetchData, authToken } = useApi();
  const { handleSuccessInModal } = useModalManagement();
  console.log('selectedEntries : ', selectedEntries);

  // State permettant de gérer le spinner de chargement
  const [isLoading, setIsLoading] = useState(false);

  const getBodyContent = () => {
    switch (name) {
      case 'users':
        return { usernames: selectedEntries };
      case 'ingredients':
        return { titles: selectedEntries };
      default:
        return '';
    }
  };

  // Méthode permettant l'appel API
  const handleDelete = async () => {
    setIsLoading(true);

    // Informations nécessaires pour la requête
    const options = {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(getBodyContent()),
    };

    // Interroge l'API en demandant la suppression de tous les Users de selectedEntries
    const { response } = await fetchData(`http://localhost:8000/api/${name}`, options);

    if (!response.ok) {
      setIsLoading(false);
      return;
    }
    // Si la requête a réussi, ferme la modale et "recharge" la page
    handleSuccessInModal(response, handleClose, handleSuccess, setIsLoading);

    // Vide le tableau des utilisateurs à supprimer
    setSelectedEntries([]);
  };

  return (
    <>
      <SpinnerWrapper $showSpinner={isLoading} />
      <Modal show onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="modal-title">
            Suppression
            {(() => {
              if (name === 'users') {
                return ' d\'employé';
              } if (name === 'ingredients') {
                return ' d\'ingrédient';
              }
              return '';
            })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>
            Voulez-vous supprimer le ou les
            {(() => {
              if (name === 'users') {
                return ' employés ';
              } if (name === 'ingredients') {
                return ' ingrédients ';
              }
              return '';
            })}
            ?
          </p>
          <p>
            {selectedEntries.map((username, index) => (
              <React.Fragment key={username}>
                {username}
                {index !== selectedEntries.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-center w-100">
            <Button variant="success" size="sm" className="me-4" onClick={handleDelete}>
              Valider
            </Button>
            <Button variant="primary" size="sm" onClick={handleClose}>
              Annuler
            </Button>
          </div>
        </Modal.Footer>
        {errors && <p className="text-primary text-center">{errors}</p>}
      </Modal>
    </>
  );
}

GenericDeleteModal.propTypes = {
  name: propTypes.string.isRequired,
  selectedEntries: propTypes.oneOfType([
    propTypes.array,
  ]).isRequired,
  setSelectedEntries: propTypes.func.isRequired,
  handleClose: propTypes.func.isRequired,
  handleSuccess: propTypes.func.isRequired,

};

export default GenericDeleteModal;
