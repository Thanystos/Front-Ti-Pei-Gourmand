import React, { useState, useEffect } from 'react';
import AdminUserAddAndEditModal from '../AdminUserAddAndEditModal';
import AdminUserDeleteModal from '../AdminUserDeleteModal';
import SpinnerWrapper from '../../SpinnerWrapper';
import { useAuth, useApiRequest } from '../../../utils/hooks';
import { Button, Container, Dropdown, Form, Table } from 'react-bootstrap';
import { getLabelForColumn, getColumnValue } from '../../../utils/helpers/adminUserTable';

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

  // State permettant de savoir quelles colonnes sont affichées
  const [displayedColumns, setDisplayedColumns] = useState({
    username: true,
    roles: true,
    phoneNumber: true,
    email: true,
    hireDate: true,
    endDate: false,
    employmentStatus: false,
    socialSecurityNumber: false,
    comments: false,
  });

  // Sate contenant l'ensemble des utilisateurs dont la case a été cochée. Utilie pour DELETE.
  const [selectedUsernames, setSelectedUsernames] = useState([]);

  // State permettant de gérer l'ouverture / fermeture du Dropdown du choix des colonnes à afficher
  const [showDropdown, setShowDropdown] = useState(false);

  /*
    Contient le token d'authentification et le username de l'utilisateur connecté.
    Partagés par un provider.
  */
  const { authToken, authUser } = useAuth();

  //Utilisation du hook useApiRequest 
  const { error, fetchData } = useApiRequest();

  // State permettant de gérer le spinner de chargement
  const [isLoading, setIsLoading] = useState(true);

  // Méthode permettant d'inverser l'état du Dropdown (ouvert / fermé)
  const handleToggle = () => setShowDropdown(!showDropdown);

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
  
      return updatedUsernames;
    });
  };

  /* 
    Méthode permettant d'inverser l'état de la colonne qui vient d'être cochée / décochée
    depuis le Dropdown des colonnes à afficher
  */
  const handleColumnChange = (columnName) => {
    setDisplayedColumns((prevColumns) => {
      return { ...prevColumns, [columnName]: !prevColumns[columnName] };
    });
  };

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

    if (!data) {
      setIsLoading(false);
      return;
    }

    console.log('data final : ', data);

    // Je recopie toutes les colonnes de User
    setUsers(data['hydra:member'].map(user =>({
      ...user,
    })));

    // Les données nécessaires à l'affichage ont été récupérées. Je retire le loading
    setIsLoading(false);
  };
  
  // Appel de la méthode de requête d'API
  fechDataAsync();
  
  // Retrait du warning lié à l'absence de fetchData en dépendance
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, reloadData]);

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
                      <th key="realName" scope="col" className='text-center'>Nom</th>

                      {Object.entries(displayedColumns).map(([columnValue, isActive]) => {
                        return isActive && (
                          <th key={columnValue} scope="col" className='text-center'>
                            {getLabelForColumn(columnValue)}
                          </th>
                        );
                      })}

                      <th scope="col"></th>
                    </tr>
                  </thead>

                  <tbody>

                    {/* 
                      La méthode map itère sur chaque élément du tableau 'users' 
                      et applique une fonction à chaque 'user' 
                    */}
                    {users.map((user) => (
                      <tr key={user.id}>

                        {authUser !== user.username ? (
                          <td className='text-center'>
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
                        <td className='text-center'>{user.realName}</td>
                        
                        {Object.entries(displayedColumns).map(([columnKey, isActive]) => (
                          isActive && (
                            <td key={columnKey} className='text-center'>
                              {getColumnValue(user, columnKey)}
                            </td>
                          )
                        ))}

                        <td className='text-center'>
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

            <Dropdown show={showDropdown} className='mt-4 d-flex justify-content-center'>
              
              <Dropdown.Toggle variant="info" size='sm' id="dropdown-basic" onClick={handleToggle}>
                Informations à afficher
              </Dropdown.Toggle>

              <Dropdown.Menu className='ps-3 pe-3' style={{width: '167px', fontSize: '.875rem'}}>
                {Object.entries(displayedColumns).map(([columnName, isActive]) => (
                  <Form.Check
                    key={columnName}
                    type="checkbox"
                    label={getLabelForColumn(columnName)}
                    checked={isActive}
                    onChange={() => handleColumnChange(columnName)}
                  />
                ))} 
              </Dropdown.Menu>

            </Dropdown>

            {modalOpen && (modalType === 'add' || modalType === 'edit') && (
              <AdminUserAddAndEditModal
                handleClose={handleModalClose}
                handleSuccess={() => {
                  setReloadData(!reloadData);
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
                  setReloadData(!reloadData);
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