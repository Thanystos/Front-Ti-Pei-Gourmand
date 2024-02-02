import React, { useState } from 'react';
import useApiRequest from '../../../utils/hooks';
import SpinnerWrapper from '../../SpinnerWrapper';
import { Button, Form, Modal } from 'react-bootstrap';

const AdminUserAddAndEditModal = ({ authToken, handleClose, handleSuccess, user }) => {

  // States récupérant le contenu des champs du même nom du formulaire
  const [username, setUsername] = useState(user ? user.username : '');
  const [realName, setRealName] = useState(user ? user.realName : '');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState(user ? user.roles : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [phoneNumber, setPhoneNumber] = useState(user ? user.phoneNumber : '');
  const [employmentStatus, setEmploymentStatus] = useState(user ? user.employmentStatus : '');
  const [socialSecurityNumber, setSocialSecurityNumber] = useState(user ? user.socialSecurityNumber : '');
  const [comments, setComments] = useState(user ? user.comments : '');
  const [imageFile, setImageFile] = useState(null);
  const [imageName, setImageName] = useState('');
  
  

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
  const stringToDate = (date) => {

    // On crée un objet Date avec notre String de date
    const formattedDate = new Date(date);

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
  const [endDate, setEndDate] = useState(user ? stringToDate(user.endDate) : '');

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

  // Action à effectuer lorsque un fichier (image) est ajouté
  const handleImageChange = (e) => {

    // On récupère le fichier du passé
    const file = e.target.files[0];

    // On met à jour notre state avec le contenu du fichier
    setImageFile(file);

    // On met à jour notre state avec le nom du fichier
    setImageName(file.name);
  };

  // Requête l'API à la soumission du formulaire
  const handleSubmit = async (event) => {

    // On retire le comportement par défaut du formulaire
    event.preventDefault();

    // Il faut obligatoirement qu'un rôle ait été attribué sinon on sort empêche le submit
    if(roles.length  === 0) {
      alert('Veuillez sélectionner au moins un rôle.');
      return;
    }

    // Contiendra le fichier. FormData est obligatoire pour pouvoir le transmettre à l'API
    const formData = new FormData();

    // Si une image a été spécifiée
    if(imageFile !== null) {

      // On construit notre formData avec les informations de cette dernière
      formData.append('image', imageFile);
      formData.append('imageName', imageName);
    }

    // Informations nécessaires pour la requête
    const userOptions = user ? {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'content-type': 'application/ld+json'
      },
      body: JSON.stringify({ 
        username, 
        roles, 
        password, 
        realName, 
        phoneNumber, 
        email, 
        hireDate, 
        endDate, 
        employmentStatus, 
        socialSecurityNumber, 
        comments,

        // on passe un paramètre supplémentaire indiquant si une image a été spécifiée
        hasImage: !!imageFile
      }),
    } : {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'content-type': 'application/ld+json'
      },
      body: JSON.stringify({ 
        username, 
        roles, 
        password, 
        realName, 
        phoneNumber, 
        email, 
        hireDate, 
        endDate, 
        employmentStatus, 
        socialSecurityNumber, 
        comments,
      }),
    };

    const imagePostOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    };

    const imageDeleteOptions = {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    };

    // Si un user a été spécifié on utilise l'url pour le PUT sinon c'est celle du POST
    const userUrl = user ? `http://localhost:8000/api/users/${user.id}` : 'http://localhost:8000/api/users';

    // Méthode requêtant l'API
    const updateUserAndImage = async () => {
      try {
        
        // On requête l'API pour traiter l'inscription ou la modification d'un User
        const { data: userData, response } = await fetchData(userUrl, userOptions);
        
        // On construit l'url de l'image associée à l'utilisateur à partir de l'id de ce dernier
        const imagePostUrl = `http://localhost:8000/api/images/${userData.user.id}`;
    
        // Si une image a été spécifiée dans le formulaire
        if (imageFile !== null) {

          /* 
            N'est vraie que si on a modifié un utilisateur avec une nouvelle image. 
            Dans ce cas on récupère l'id de la précédente image qu'on va vouloir effacer
          */
          if (userData.user.userImageId !== null) {

            // On construit l'url avec l'id de l'ancienne image
            const imageDeleteUrl = `http://localhost:8000/api/images/${userData.user.userImageId}`

            // On requête l'API pour supprimer l'ancienne image
            await fetchData(imageDeleteUrl, imageDeleteOptions);
          }
    
          // On requête l'API pour inscrire la nouvelle image
          await fetchData(imagePostUrl, imagePostOptions);
    
          // Si la requête a réussi, ferme la modale et "recharge" la page
          handleSuccessInModal({ response }, handleClose, handleSuccess);
        } else {

          // Si la requête a réussi, ferme la modale et "recharge" la page
          handleSuccessInModal({ response }, handleClose, handleSuccess);
        }
      } catch (error) {
        console.error("Une erreur s'est produite lors de la mise à jour de l'utilisateur :", error);
      }
    };
    
    updateUserAndImage();
  };

  return (
    <>
      <SpinnerWrapper $showSpinner={isLoading} />
      {error ? (
        <p>{error}</p>
      ) : (
        <Modal show={true} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title className="modal-title">{user ? 'Édition ' : 'Ajout '}d'employé</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit} encType='multipart/form-data'>
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
                <Form.Label>Date d'embauche</Form.Label>
                <Form.Control 
                  type="date" 
                  onChange={(e) => setHireDate(e.target.value)} 
                  value={hireDate} 
                  max={getCurrentDate()} 
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="enddate">
                <Form.Label>Fin du contrat</Form.Label>
                <Form.Control 
                  type="date" 
                  onChange={(e) => setEndDate(e.target.value)} 
                  value={endDate} 
                  min={getCurrentDate()} 
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="employmentstatus">
              <Form.Label>Type de contrat</Form.Label>
                <Form.Select 
                  className="mb-3" 
                  aria-label="Type de contrat" 
                  onChange={(e) => setEmploymentStatus(e.target.value)} 
                  value={employmentStatus}
                >
                  <option value="" disabled={user !== null}>-----</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Intérim">Intérim</option>
                  <option value="Temps partiel">Temps partiel</option>
                  <option value="Saisonnier">Saisonnier</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="socialsecuritynumber">
                <Form.Label>N° Sécu</Form.Label>
                <Form.Control 
                  type="text" 
                  maxLength={20} 
                  onChange={(e) => setSocialSecurityNumber(e.target.value)} 
                  value={socialSecurityNumber} 
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="comments">
                <Form.Label>Commentaires</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  onChange={(e) => setComments(e.target.value)} 
                  value={comments} 
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="image">
                <Form.Label>Image de profil</Form.Label>
                <Form.Control type="file" onChange={handleImageChange} />
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