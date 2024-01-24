import React, { useState, useEffect } from 'react';
import AdminUserAddAndEditModal from '../AdminUserAddAndEditModal';
import AdminUserDeleteModal from '../AdminUserDeleteModal';
import SpinnerWrapper from '../SpinnerWrapper';
import { useAuth } from '../../utils/hooks';
import useApiRequest from '../../utils/hooks';
import { Button, Container, Form, Table } from 'react-bootstrap';
import { differenceInMonths } from 'date-fns';

const AdminUserTable = () => {

  // State récupérant l'ensemble des utilisateurs enregistrés
  const [users, setUsers] = useState([]);

  // State récupérant un utilisateur en particulier
  const [selectedUser, setSelectedUser] = useState(null);

  // State permettant de gérer l'ouverture et la fermeture d'une modale
  const [modalOpen, setModalOpen] = useState(false);

  // State permettant de définir la modale à utiliser (édition, suppression etc...)
  const [modalType, setModalType] = useState(null);

  // State permettant de "recharger" la page en redéclenchant le useEffect
  const [reloadData, setReloadData] = useState(false);

  /*
    Contient le token d'authentification et le username de l'utilisateur connecté.
    Partagés par un provider.
  */
  const { authToken, authUser } = useAuth();

  // Sate contenant l'ensemble des utilisateurs dont la case a été cochée. Utilie pour DELETE.
  const [selectedUsernames, setSelectedUsernames] = useState([]);

  /*
    Utilisation du hook useApiRequest
    On indique en paramètre la valeur par défaut du state isLoading
  */
    const { isLoading, error, fetchData, isRedirected } = useApiRequest(true);
  

  // Calcule le nombre de mois entre l'embauche et la date actuelle
  const calculateMonthsOfService = (hireDate) => {
    const currentDate = new Date();
    const difference = differenceInMonths(currentDate, hireDate);

    return difference;
  }

  // Convertit les roles en bdd en texte plus convivial pour de l'affichage
  const mapRoles = (roles) => {
    return roles.map(role => {
      switch (role) {
        case 'ROLE_ADMIN':
          return 'Admin';
        case 'ROLE_CUISINIER':
          return 'Cuisinier';
        default:
          return role;
      }
    });
  }

  /* Cette méthode n'aurait pas besoin d'être aussi tordue mais montre pourquoi usestate
     est parfois embêtante. Usestate est asynchrone et demander d'afficher le contenu d'un
     state juste après sa maj p.e compliqué. En effet il se peut que ce dernier n'ait pas 
     été maj au moment de l'affichage ce qui donnera des valeurs incohérentes. Utiliser 
     des fonctions de rappel peut alors être une solution comme montré ci-dessous.
   */

  const handleCheckboxChange = (username) => {

    // prevUserIds est l'état précédent de selectedUserIds
    setSelectedUsernames((prevUsernames) => {
  
      /* Vérifie si l'id de l'utilisateur qui vient d'être coché / décoché était déjà
         présent dans le tableau des utilisateurs cochés
         Si oui on le retire sinon on l'ajoute
      */
      const updatedUsernames = prevUsernames.includes(username)
        ? prevUsernames.filter((name) => name !== username)
        : [...prevUsernames, username];
  
      /* Ainsi l'affichage devient cohérent
        Ce log se déclenche immédiatement avec prevUserIds passé en param de la fct de rappel
        console.log("Previous User Ids:", prevUsernames);

         Ce log va devoir attendre la fin du calcul de updateUserIds
         console.log("Updated User Ids:", updatedUsernames);
      */
  
      return updatedUsernames;
    });
  };

  useEffect(() => {

    // Méthode permettant l'appel API
    const fechDataAsync = async () => {

      // Informations nécessaires pour la requête
      const options = {
        method: 'GET',
        headers : {
          'authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      };
  
    // Interroge l'API en demandant la récupération de tous les Users
    const { data } = await fetchData('http://localhost:8000/api/users', options);

    /* Que la requête ait réussi ou pas, je ne l'affiche pas de suite mais si ça a été le cas,
      elle sera relancée au changement du state isredirected qui cette fois sera false et 
      permettra l'affichage
    */
    if(isRedirected === false) {

      // Je recopie toutes les colonnes de User sauf hireData et roles que je remplace 
      // par l'ancienneté et les roles plus convivaux
      setUsers(data['hydra:member'].map(user =>({
        ...user,
      })));
    }
  };
  
  // Appel de la méthode de requête d'API
  fechDataAsync();

  // Retrait du warning lié à l'absence de fetchData en dépendance
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, reloadData, isRedirected]);

  // Méthode déclenchée au click sur le bouton d'édition
  const handleEditClick = (user) => {
    // Le state prend l'utilisateur qui va être modifié
    setSelectedUser(user);
    // Permettra de définir la modale à utiliser
    setModalType('edit');
    // Permet l'ouverture de la modale
    setModalOpen(true);
  };

  // Méthode déclenchée au clic sur le bouton "Ajouter"
  const handleAddClick = () => {

    // Permettra le montage du composant AdminUserAddModal
    setModalType('add');

    // Autorise l'ouverture de la modale
    setModalOpen(true);
  }


  // Méthode déclenchée au clic sur le bouton "Supprimer"
  const handleDeleteClick = () => {

    // Permettra le montage du composant AdminUserDeleteModal
    setModalType('delete');

    // Indique que la modale doit être ouverte
    setModalOpen(true);
  };


  // Méthode déclenchée au clic sur le bouton "Annuler" ou sur la croix de fermeture de la modale
  const handleModalClose = () => {

    // Indique que la modale doit être fermée
    setModalOpen(false);
    setSelectedUser(null);

    // Plus aucun type de modale n'est défini
    setModalType(null);
  };

  return (
    <>
      <SpinnerWrapper $showSpinner={isLoading} />
      {error ? (
        <p>{error}</p>
      ) : (
        // Il est essentiel d'utiliser un conteneur pour englober l'ensemble de l'expression
        <>
          <Container fluid className="pt-4 px-4">
      <div className="bg-secondary text-center rounded p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0">Liste des utilisateurs</h6>
        </div>
        <div className="table-responsive">
          <Table className="text-start align-middle table-bordered table-hover mb-0">
            <thead>
              <tr className="text-white">
                <th scope="col"></th>
                <th scope="col">Pseudonyme</th>
                <th scope="col">Nom</th>
                <th scope="col">Téléphone</th>
                <th scope="col">E-mail</th>
                <th scope="col">Ancienneté</th>
                <th scope="col">Rôle(s)</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                {authUser !== user.username ? (
                  <td>
                    <Form.Check 
                      type="checkbox" 
                      onChange={() => handleCheckboxChange(user.username)} 
                      checked={selectedUsernames.includes(user.username)}
                    />
                </td>
                ) : (
                  <td>
                  </td>
                )}
                <td>{user.username}</td>
                <td>{user.realName}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.email}</td>
                <td>{calculateMonthsOfService(user.hireDate)} mois</td>
                <td>{mapRoles(user.roles).join(' / ')}</td>
                <td>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => handleEditClick(user)}
                  >
                    Modifier
                  </Button>
                </td>
              </tr>
            ))}
            </tbody>
          </Table>
        </div>
        <div className="d-flex justify-content-center mt-4">
          <Button variant="success" 
            size="sm" 
            className="me-4" 
            onClick={() => handleAddClick()}
          >
            Ajouter
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => handleDeleteClick()}
            disabled={selectedUsernames.length === 0}
          >
            Supprimer
          </Button>
        </div>
      </div>

      {modalOpen && (modalType === 'add' || modalType === 'edit') && (
        <AdminUserAddAndEditModal
          authToken={authToken}
          handleClose={handleModalClose}
          handleSuccess={() => {
            setReloadData(prevState => !prevState);
          }}
          user={selectedUser}
        />
      )}

      {modalOpen && modalType === 'delete' && (
        <AdminUserDeleteModal
          selectedUsernames={selectedUsernames}
          setSelectedUsernames={setSelectedUsernames}
          authToken={authToken}
          handleClose={handleModalClose}
          handleSuccess={() => {
            setReloadData(prevState => !prevState);
          }}
        />
      )}
    </Container>
        </>
      )}
    </>
  );
};

export default AdminUserTable;



















/*
<table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>
                    <button onClick={() => handleEditClick(user)}>Éditer</button>
                  </td>
                  <td>
                  {authUser !== user.username && ( // Vérifie si l'utilisateur connecté est différent de l'utilisateur dans la boucle
                    <button onClick={() => handleDeleteClick(user)}>Supprimer</button>
                  )}
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                    <button onClick={() => handleAddClick()}>Ajouter</button>
                </td>
              </tr>
            </tbody>
          </table>
          
          {modalOpen && modalType === 'edit' && (
            <AdminUserEditModal
              user={selectedUser}
              authToken={authToken}
              handleClose={handleModalClose}
              handleEditSuccess={(updatedUser) => {
                console.log(updatedUser);
                // Mise à jour locale des utilisateurs après le succès du PUT
                const updatedUsers = users.map((user) =>
                  user.id === updatedUser.id ? updatedUser : user
                );
                setUsers(updatedUsers);
              }}
            />
          )}

          */