import React from 'react';
import useApiRequest from '../../utils/hooks';
import { Button, Modal } from 'react-bootstrap';
import SpinnerWrapper from '../SpinnerWrapper';

const AdminUserDeleteModal = ({ selectedUsernames, setSelectedUsernames, authToken, handleClose, handleSuccess }) => {

  // Utilisation du hook useApiRequest
  const { isLoading, error, fetchData, handleSuccessInModal } = useApiRequest();

  // Méthode permettant l'appel API
  const handleDelete = async () => {

    // Informations nécessaires pour la requête
    const options = {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ usernames: selectedUsernames }),
    };
    
    // Interroge l'API en demandant la suppression de tous les Users de selectedUsernames
    await fetchData('http://localhost:8000/api/users', options)
    .then(({ response }) => {

      // Si la requête a réussi, ferme la modale et "recharge" la page
      handleSuccessInModal({ response }, handleClose, handleSuccess);

      // Vide le tableau des utilisateurs à supprimer
      setSelectedUsernames([]);
    });
  };

  return (
    <>
      <SpinnerWrapper $showSpinner={isLoading} />
      {error ? (
        <p>{error}</p>
      ) : (
        <Modal show={true} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title className="modal-title">Suppression d'utilisateurs</Modal.Title>
          </Modal.Header>
          <Modal.Body className='text-center'>
            <p>Voulez-vous supprimer les utilisateurs ?</p>
            <p>
              {selectedUsernames.map((username, index) => (
                <React.Fragment key={username}>
                  {username}
                  {index !== selectedUsernames.length - 1 && <br />}
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
        </Modal>
      )}
    </>
  );
}

export default AdminUserDeleteModal;