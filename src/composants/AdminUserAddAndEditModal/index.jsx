import React, { useState } from 'react';
import useApiRequest from '../../utils/hooks';
import SpinnerWrapper from '../SpinnerWrapper';
import { Button, Form, Modal } from 'react-bootstrap';

const AdminUserAddAndEditModal = ({ authToken, handleClose, handleSuccess, user }) => {

  // States récupérant le contenu des champs du même nom du formulaire
  const [username, setUsername] = useState(user ? user.username : '');
  const [roles, setRoles] = useState(user ? user.roles : '');
  const [password, setPassword] = useState('');
  const [realName, setRealName] = useState(user ? user.realName : '');
  const [image, setImage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user ? user.phoneNumber : '');
  const [email, setEmail] = useState(user ? user.email : '');

  // Utilisation du hook useApiRequest
  const { isLoading, error, fetchData, handleSuccessInModal } = useApiRequest();

  /*
    Permet de retourner la date actuelle à transmettre au champ date afin que ce dernier
    ne puisse pas accepter des valeurs ultérieures à cette dernière
  */
  const getCurrentDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();

    // Les mois commencent à 0, d'où le + 1
    let month = currentDate.getMonth() + 1;
    let day = currentDate.getDate();

    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;

    return `${year}-${month}-${day}`;
  };

  // Convertit la String de date de la bdd en Date pour la valeur par défaut du champ date
  const stringToDate = (hireDate) => {

    // On crée un objet Date avec notre String de date
    const formattedDate = new Date(hireDate);

    // On en déduit l'année
    const year = formattedDate.getFullYear();

    // Les mois commencent à 0, d'où le + 1. On en déduit le mois
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0');

    // On en déduit le jour
    const day = formattedDate.getDate().toString().padStart(2, '0');

    // on retourne la date convertit en Date
    return `${year}-${month}-${day}`;
};

  const [hireDate, setHireDate] = useState(user ? stringToDate(user.hireDate) : '');

  // Action à effectuer lorsque les rôles sont changés via les checkbox
  const handlerolesChange = (e) => {

    // Récupère la valeur et l'état de mes checkbox
    const { value, checked } = e.target;

    // Contient les rôles actuellement check
    const updatedRoles = [...roles];
  
    // Si la case vient d'être cochée
    if (checked) {

      // On ajoute le rôle associé dans le tableau des rôles
      updatedRoles.push(value);
    
    // Sinon
    } else {

      // On trouve la position du rôle dans le tableau des rôles
      const index = updatedRoles.indexOf(value);
      if (index !== -1) {

        // On retire le rôle associé du tableau des rôles
        updatedRoles.splice(index, 1);
      }
    }

    // On met à jour le tableau des rôles avec le nouveau tableau duquel on a ajouté ou retiré un rôle
    setRoles(updatedRoles);
  };

  // Requête l'API à la soumission du formulaire
  const handleSubmit = async (event) => {

    // On retire le comportement par défaut du formulaire
    event.preventDefault();

    if(roles.length  === 0) {
      alert('Veuillez sélectionner au moins un rôle.');
      return;
    }

    // Informations nécessaires pour la requête
    const options = {
      method: user ? 'PUT' : 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/ld+json'
      },
      body: JSON.stringify({ username, roles, password, realName, image, phoneNumber, email, hireDate }),
    };

    const url = user ? `http://localhost:8000/api/users/${user.id}` : 'http://localhost:8000/api/users';

    // Interroge l'API en lui demandant de créer un nouvel utilisateur avec les données du formulaire
    await fetchData(url, options)
    .then(({ response }) => {

      // Si la requête a réussi, ferme la modale et "recharge" la page
      handleSuccessInModal({ response }, handleClose, handleSuccess);
    })
  };

  return (
    <>
      <SpinnerWrapper $showSpinner={isLoading} />
      {error ? (
        <p>{error}</p>
      ) : (
        <Modal show={true} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title className="modal-title">Ajout d'utilisateur</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Pseudonyme<span className='text-primary ml-2'>*</span></Form.Label>
                <Form.Control type="text" onChange={(e) => setUsername(e.target.value)} value={username} required />
              </Form.Group>

              <Form.Group className="mb-3" controlId="realname">
                <Form.Label>Nom<span className='text-primary ml-2'>*</span></Form.Label>
                <Form.Control type="text" onChange={(e) => setRealName(e.target.value)} value={realName} required />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Mot de passe{!user && <span className='text-primary ml-2'>*</span>}</Form.Label>
                <Form.Control 
                  type="password" 
                  onChange={(e) => setPassword(e.target.value)} 
                  value={password} 
                  required={user ? false : true}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Rôles à attribuer<span className='text-primary ml-2'>*</span></Form.Label>
                <div>
                  <Form.Check
                    type="checkbox"
                    label="Admin"
                    name="adminRole"
                    id="adminRole"
                    value="ROLE_ADMIN"
                    checked={roles.includes('ROLE_ADMIN') || roles.includes('Admin')}
                    onChange={handlerolesChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Cuisinier"
                    name="cuisinierRole"
                    id="cuisinierRole"
                    value="ROLE_CUISINIER"
                    checked={roles.includes('ROLE_CUISINIER') || roles.includes('Cuisinier')}
                    onChange={handlerolesChange}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email<span className='text-primary ml-2'>*</span></Form.Label>
                <Form.Control type="email" onChange={(e) => setEmail(e.target.value)} value={email} required />
              </Form.Group>

              <Form.Group className="mb-3" controlId="telephone">
                <Form.Label>Téléphone<span className='text-primary ml-2'>*</span></Form.Label>
                <Form.Control type="tel" onChange={(e) => setPhoneNumber(e.target.value)} value={phoneNumber} required />
              </Form.Group>

              <Form.Group className="mb-3" controlId="hiredate">
                <Form.Label>Date d'embauche<span className='text-primary ml-2'>*</span></Form.Label>
                <Form.Control 
                  type="date" 
                  onChange={(e) => setHireDate(e.target.value)} 
                  value={hireDate} 
                  required
                  max={getCurrentDate()} 
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="image">
                <Form.Label>Image de profil</Form.Label>
                <Form.Control type="file" onChange={(e) => setImage(e.target.value)} />
              </Form.Group>

              <div className="d-flex justify-content-center w-100">
                <Button variant="success" size="sm" className="me-4" type="submit">
                  Valider
                </Button>

                <Button variant="primary" size="sm" onClick={handleClose}>
                  Annuler
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default AdminUserAddAndEditModal;