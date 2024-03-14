import React, { useState, useEffect } from 'react';
import AdminUserAddAndEditModal from '../AdminUserAddAndEditModal';
import AdminUserDeleteModal from '../AdminUserDeleteModal';
import { useApi } from '../../../utils/hooks';
import { Button, Container, Dropdown, Form, Table } from 'react-bootstrap';
import { getLabelForColumn, getColumnValue } from '../../../utils/helpers/adminUserTable';
import SpinnerWrapper from '../../SpinnerWrapper';

const AdminUserTable = () => {

  // States et méthodes partagés par mon provider
  const { setErrors, fetchData, authToken, authUser } = useApi();

  // State contenant l'ensemble des Users enregistrés
  const [users, setUsers] = useState([]);

  // State contenant un Users en particulier
  const [selectedUser, setSelectedUser] = useState(null);

  // Sate contenant un tableau des Users dont la checkbox a été cochée.
  const [selectedUsernames, setSelectedUsernames] = useState([]);

  // State permettant de définir les informations des Users à afficher
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

  // State permettant de gérer l'ouverture et la fermeture d'une modale
  const [modalOpen, setModalOpen] = useState(false);

  // State permettant de définir la modale à utiliser (édition, suppression etc...)
  const [modalType, setModalType] = useState(null);

  // State permettant de "recharger" la page en redéclenchant la requête GET
  const [reloadData, setReloadData] = useState(false);

  // State permettant de gérer l'état de la liste déroulante du choix des colonnes à afficher
  const [showDropdown, setShowDropdown] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  // Méthode déclenchée au clic sur la liste déroulante et inversant son état (ouvert / fermé)
  const handleToggle = () => setShowDropdown(!showDropdown);

  // Méthode déclenchée au clic sur une des checkbox associée à une entrée de User et qui ajoute ou retire ce User du tableau de ceux cochés
  const handleCheckboxChange = (username) => {

    // Mets à jour le tableau des Users en prenant l'état précédent de ce dernier et en retirant ou en ajoutant le User concerné par l'event
    setSelectedUsernames((prevUsernames) => {

      // Si le User était déjà présent dans le tableau on le retire et si ce n'était pas le cas, on l'ajoute
      const updatedUsernames = prevUsernames.includes(username)
        ? prevUsernames.filter((name) => name !== username)
        : [...prevUsernames, username];
  
      return updatedUsernames;
    });
  };

  // Méthode déclenchée au clic sur une des options de la liste déroulante des colonnes à afficher et qui inverse l'état de la colonne concernée par l'event
  const handleColumnChange = (columnName) => {

    // Copie l'état préédent du state contenant l'information sur l'état de toutes les colonnes en inversant uniquement l'état de celle concernée par l'event
    setDisplayedColumns((prevColumns) => {
      return { ...prevColumns, [columnName]: !prevColumns[columnName] };
    });
  };

  // Méthode déclenchée au click sur le bouton d'édition et qui se charge de déclencher l'affichage de la modale d'édition
  const handleEditClick = (user) => {

    // Met le state contenant l'utilisateur sélectionné à jour avec celui dont le bouton d'édition a été cliqué
    setSelectedUser(user);

    // Met à jour le state permettant de déterminer le type de modale à ouvrir
    setModalType('edit');

    // Permet l'ouverture de la modale
    setModalOpen(true);
  };

  // Méthode déclenchée au clic sur le bouton d'ajout et qui se charge de déclencher l'affichage de la modale d'ajout
  const handleAddClick = () => {

    // Met à jour le state permettant de déterminer le type de modale à ouvrir
    setModalType('add');

    // Permet l'ouverture de la modale
    setModalOpen(true);
  }


  // Méthode déclenchée au clic sur le bouton de suppression et qui se charge de déclencher l'affichage de la modale de suppression
  const handleDeleteClick = () => {

    // Met à jour le state permettant de déterminer le type de modale à ouvrir
    setModalType('delete');

    // Permet l'ouverture de la modale
    setModalOpen(true);
  };


  // Méthode déclenchée à la validation de la modale ou au clic sur le bouton de fermeture de cette dernière afin de la fermer
  const handleModalClose = () => {

    // Permet la fermeture de la modale
    setModalOpen(false);

    // Plus aucun User ne doit être considéré comme sélectionné
    setSelectedUser(null);

    // Plus aucun type de modale à gérer ne doit être défini
    setModalType(null);

    // On met à jour le state contenant les erreurs qu'auraient pu être affichée dans la modale
    setErrors([]);
  };

  /* 
    Se déclenche au montage initial du composant et quand après les opérations liées aux modales ont réussi.
    Requête l'API afin de récupérer la liste des Users
  */
  useEffect(() => {

    // Méthode permettant la récupérations de la liste des utilisateurs
    const fechDataAsync = async () => {
      const options = {
        method: 'GET',
        headers : {
          'authorization': `Bearer ${authToken}`,
        }
      };
  
      // Requête l'API permettant la récupération de la liste des User et entraînant la construction du cache de ces derniers
      const { data } = await fetchData('http://localhost:8000/api/users', options);

      // Si aucune donnée n'est retournée
      if (!data) {

        // On retire le loading
        setIsLoading(false);

        // On ne fait rien de plus et on sort de la méthode
        return;
      }

      // Je récupère toutes les informations pertinentes concernant mes Users
      setUsers(data['hydra:member'].map(user =>({
        ...user,
      })));

      // Les données nécessaires à l'affichage ont été récupérées. Je retire le loading
      setIsLoading(false);
    };

    fechDataAsync();
  /* 
    React me conseille de mettre un certain nombre de dépendances or le useeffect ne doit se 
    déclencher que si les modales indiquent la réussite de leur requête associée. Je retire donc l'avertissement
  */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadData]);

  console.log('Montage du composant AdminUserTable');
  console.log('isloading table : ', isLoading)
  return (
    <>
      <SpinnerWrapper $showSpinner={isLoading} />
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
  );
};

export default AdminUserTable;