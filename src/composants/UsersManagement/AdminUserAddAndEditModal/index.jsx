import React, { useEffect, useState } from 'react';
import { useApi, useModalManagement } from '../../../utils/hooks';
import { Button, Form, Modal } from 'react-bootstrap';
import { getUserRoles, getCurrentDate, stringToDate } from '../../../utils/helpers/adminUserAddAndEditModal';
import SpinnerWrapper from '../../SpinnerWrapper';

const AdminUserAddAndEditModal = ({ handleClose, handleSuccess, user }) => {

  // States et méthodes partagés par mes providers
  const { cache, errors, fetchData, authToken, updateUserAuth, updateAssociativeEntity } = useApi();
  const { handleSuccessInModal } = useModalManagement();


   // States récupérant le contenu des champs du même nom du formulaire
   const [username, setUsername] = useState(user ? user.username : '');
   const [realName, setRealName] = useState(user ? user.realName : '');
   const [password, setPassword] = useState('');
   const [email, setEmail] = useState(user ? user.email : '');
   const [phoneNumber, setPhoneNumber] = useState(user ? user.phoneNumber : '');
   const [employmentStatus, setEmploymentStatus] = useState(user ? user.employmentStatus : '');
   const [socialSecurityNumber, setSocialSecurityNumber] = useState(user ? user.socialSecurityNumber : '');
   const [comments, setComments] = useState(user ? user.comments : '');
   const [imageFile, setImageFile] = useState(null);
   const [imageName, setImageName] = useState('');
   const [hireDate, setHireDate] = useState(user ? stringToDate(user.hireDate) : '');
   const [endDate, setEndDate] = useState(user ? stringToDate(user.endDate) : '');

  // State contenant l'id des rôles associés au User
  const [userRoles, setUserRoles] = useState(user ? getUserRoles(user).map(role => role.id) : []);
  
  // On copie l'état initial du state des rôles associés au User
  const initialUserRoles = user ? getUserRoles(user).map(role => role.id) : [];

  // State contenant l'intégralité des Rôles qu'il est possible d'attribuer
  const [allRoles, setAllRoles] = useState([]);

  // Contient la réponse de la requête d'inscription ou de modification du User
  const [userResponse, setUserResponse] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  // Détermine si un role est présent dans notre Set de roles
  const isRoleSelected = (roleId) => userRoles.includes(roleId);
  
  // Action à effectuer lorsque les rôles sont changés via les checkbox
  const handlerolesChange = (roleName) => {

    // Récupère l'ID du rôle sélectionné
    const roleId = allRoles.find(role => role.name === roleName)?.id;

    // Met à jour l'ensemble des rôles de l'utilisateur avec la copie mise à jour
    setUserRoles((prevUserRoles) => 
      prevUserRoles.includes(roleId)
        ? prevUserRoles.filter((role) => role !== roleId)
        : [...prevUserRoles, roleId]
    );
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
  const handleSubmit = async (e) => {

    // Mes requêtes vont s'effectuer, j'affiche mon loading
    setIsLoading(true);

    // On retire le comportement par défaut du formulaire
    e.preventDefault();

    // Il faut obligatoirement qu'un rôle ait été attribué sinon on sort et on empêche le submit
    if(userRoles.size  === 0) {
      alert('Veuillez sélectionner au moins un rôle.');

      // Je retire le loading
      setIsLoading(false);
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

    const isPostMethod = !user;

    // Informations nécessaires pour la requête
    const userOptions = {
      method: user ? 'PUT' : 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'content-type': 'application/ld+json'
      },
      body: JSON.stringify({ 
        username,
        password,
        realName,
        phoneNumber,
        email,
        hireDate: (hireDate === "" || hireDate === "NaN-NaN-NaN") ? null : hireDate,
        endDate: (endDate === "" || endDate === "NaN-NaN-NaN") ? null : endDate,
        employmentStatus,
        socialSecurityNumber,
        comments,

        // Ajoute hasImage seulement si la méthode est POST 
        hasImage: isPostMethod ? !!imageFile : undefined,
      }),
    };

    // Méthode requêtant l'API
    const submitUser = async () => {

      /* ************ TRAITEMENT DU USER ************ */


      // Si un user a été spécifié on utilise l'url pour le PUT sinon c'est celle du POST
      const userUrl = user ? `http://localhost:8000/api/users/${user.id}` : 'http://localhost:8000/api/users';
      
      // On requête l'API pour traiter l'inscription ou la modification d'un User
      const { data: userData, response } = await fetchData(userUrl, userOptions);

      if (!userData) {
        setIsLoading(false);
        return;
      }

      if(userData.token) {
        console.log('étrange');
        
        /* 
          Stockage de l'objet authToken dans le LocalStorage et 
          Maj des valeurs partagées par le context ApiContext
        */
        updateUserAuth(userData.token);
      }
      


      /* ************ FIN DU TRAITEMENT DU USER ************ */


      /* --------------------------------------------------- */


      /* ************ TRAITEMENT DE L'IMAGE ************ */

      
      // Si une image a été spécifiée
      if (imageFile !== null) {

        const imagePostOptions = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        };

        // On construit l'url de l'image associée à l'utilisateur à partir de l'id de ce dernier
        const imagePostUrl = `http://localhost:8000/api/users/${userData.user.id}`;

        // On requête l'API pour inscrire la nouvelle image
        await fetchData(imagePostUrl, imagePostOptions);
      }


      /* ************ FIN DU TRAITEMENT DE L'IMAGE ************ */

      setUserResponse({userData, response});
      
    };
    
    submitUser();
  };


  /* ************ TRAITEMENT DES ASSOCIATIONS USER / ROLE ************ */


  useEffect(() => {

    const fetchUserRoleData = async () => {

      await updateAssociativeEntity('user_roles', userResponse.userData.user.id, userRoles, initialUserRoles, true);

      handleSuccessInModal(userResponse.response, handleClose, handleSuccess, setIsLoading);
      
      setUserResponse(null);
    }
    
    if(userResponse && cache['http://localhost:8000/api/users']) {
      console.log('jentre');

      fetchUserRoleData();
    }

  }, [userResponse]);


  /* ************ FIN DU TRAITEMENT DES ASSOCIATIONS USER / ROLE ************ */


  useEffect(() => {

    // Méthode permettant l'appel API
    const fechRoleDataAsync = async () => {

      // Informations nécessaires pour la requête
      const options = {
        method: 'GET',
        headers : {
          'authorization': `Bearer ${authToken}`,
        }
      };

      // Interroge l'API en demandant la récupération de tous les roles attribuables
      const { data: roleData } = await fetchData('http://localhost:8000/api/roles', options);

      // Je recopie tous les rôles de Role
      setAllRoles(roleData['hydra:member'].map(role =>({
        ...role,
      })));

      // Les données nécessaires à l'affichage ont été récupérées. Je retire le loading
      setIsLoading(false);
    };

    fechRoleDataAsync();

  // Retrait du warning lié à l'absence de fetchData en dépendance
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);
  
  console.log('Montage du composant AdminUserAddAndEditModal');
  return (
    <>
      <SpinnerWrapper $showSpinner={isLoading} />
      <Modal show={true} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="modal-title">{user ? 'Édition ' : 'Ajout '}d'employé</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit} encType='multipart/form-data'>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Pseudonyme<span className='text-primary ml-2'>*</span></Form.Label>
              <Form.Control type="text" onChange={(e) => setUsername(e.target.value)} value={username} required />
              {errors.includes("duplicateUsername") && <p className="text-primary">Ce pseudonyme est déjà utilisé.</p>}
              {errors.includes("emptyUsername") && <p className="text-primary">Le pseudonyme doit être spécifié.</p>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="realname">
              <Form.Label>Nom<span className='text-primary ml-2'>*</span></Form.Label>
              <Form.Control type="text" onChange={(e) => setRealName(e.target.value)} value={realName} required />
              {errors.includes("emptyRealName") && <p className="text-primary">Le nom doit être spécifié<div className=""></div></p>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Mot de passe{!user && <span className='text-primary ml-2'>*</span>}</Form.Label>
              <Form.Control 
                type="password" 
                onChange={(e) => setPassword(e.target.value)} 
                value={password} 
                required={user ? false : true}
              />
              {errors.includes("emptyPassword") && <p className="text-primary">Le mot de passe doit être spécifié.</p>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rôles à attribuer<span className='text-primary ml-2'>*</span></Form.Label>
              <div>
                {allRoles.map((role) => (
                  <Form.Check
                    type="checkbox"
                    key={role.name}
                    label={role.name}
                    name={role.name}
                    id={role.name}
                    value={role.name}

                    // On se sert de notre fonction qui vérifie la présence de l'id dans notre Set de roles
                    checked={isRoleSelected(role.id)}
                    onChange={() => handlerolesChange(role.name)}
                  />
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email<span className='text-primary ml-2'>*</span></Form.Label>
              <Form.Control type="email" onChange={(e) => setEmail(e.target.value)} value={email} required />
              {errors.includes("emptyEmail") && <p className="text-primary">L'e-mail doit être spécifié.</p>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="telephone">
              <Form.Label>Téléphone<span className='text-primary ml-2'>*</span></Form.Label>
              <Form.Control type="tel" onChange={(e) => setPhoneNumber(e.target.value)} value={phoneNumber} required />
              {errors.includes("emptyPhoneNumber") && <p className="text-primary">Le numéro de téléphone doit être spécifié.</p>}
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
    </> 
  );
};

export default AdminUserAddAndEditModal;