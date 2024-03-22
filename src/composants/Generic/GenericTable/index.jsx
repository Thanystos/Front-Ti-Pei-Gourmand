/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import { propTypes } from 'prop-types';
import {
  Button, Container, Dropdown, Form, Table,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDesc } from '@fortawesome/free-solid-svg-icons';
import { useApi } from '../../../utils/hooks';
import { getLabelForColumn, getColumnValue, getTextColorClass } from '../../../utils/helpers/adminUserTable';
import SpinnerWrapper from '../../SpinnerWrapper';
import GenericDeleteModal from '../GenericDeleteModal';
import UserAddAndEditModal from '../../UsersManagement/UserAddAndEditModal';
import GenericAddAndEditModal from '../GenericAddAndEditModal';

function GenericTable({ name, displayedColumns, setDisplayedColumns }) {
  // States et méthodes partagés par mon provider
  const {
    setErrors, fetchData, authToken, authUser, authPermissions, cache, updateCache,
  } = useApi();

  // State contenant l'ensemble des entries enregistrées
  const [entries, setEntries] = useState([]);

  // State contenant une entry en particulier
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Sate contenant un tableau des entries dont la checkbox a été cochée.
  const [selectedEntries, setSelectedEntries] = useState([]);

  // State permettant de gérer l'ouverture et la fermeture d'une modale
  const [modalOpen, setModalOpen] = useState(false);

  // State permettant de définir la modale à utiliser (édition, suppression etc...)
  const [modalType, setModalType] = useState(null);

  // State permettant de "recharger" la page en redéclenchant la requête GET
  const [reloadData, setReloadData] = useState(false);

  // State permettant de gérer l'état de la liste déroulante du choix des colonnes à afficher
  const [showDropdown, setShowDropdown] = useState(false);

  const [sortOrders, setSortOrders] = useState({
    hireDate: 'asc',
    endDate: 'asc',
    quantity: 'asc',
    percentQuantity: 'asc',
    category: 'asc',
  });

  const [isLoading, setIsLoading] = useState(true);

  const columnNameToSort = ['hireDate', 'endDate', 'quantity', 'percentQuantity', 'category'];

  // Méthode déclenchée au clic sur la liste déroulante et inversant son état (ouvert / fermé)
  const handleToggle = () => setShowDropdown(!showDropdown);

  // Méthode déclenchée au clic sur une des checkbox associée à une entrée de User et qui ajoute ou retire ce User du tableau de ceux cochés
  const handleCheckboxChange = (entry) => {
    // Mets à jour le tableau des Users en prenant l'état précédent de ce dernier et en retirant ou en ajoutant le User concerné par l'event
    setSelectedEntries((prevEntries) => {
      // Si le User était déjà présent dans le tableau on le retire et si ce n'était pas le cas, on l'ajoute
      const updatedEntries = prevEntries.includes(entry)
        ? prevEntries.filter((identifier) => identifier !== entry)
        : [...prevEntries, entry];

      return updatedEntries;
    });
  };

  // Méthode déclenchée au clic sur une des options de la liste déroulante des colonnes à afficher et qui inverse l'état de la colonne concernée par l'event
  const handleColumnChange = (columnName) => {
    // Copie l'état préédent du state contenant l'information sur l'état de toutes les colonnes en inversant uniquement l'état de celle concernée par l'event
    setDisplayedColumns((prevColumns) => ({ ...prevColumns, [columnName]: !prevColumns[columnName] }));
  };

  // Méthode déclenchée au click sur le bouton d'édition et qui se charge de déclencher l'affichage de la modale d'édition
  const handleEditClick = (entry) => {
    // Met le state contenant l'utilisateur sélectionné à jour avec celui dont le bouton d'édition a été cliqué
    setSelectedEntry(entry);

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
  };

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
    setSelectedEntry(null);

    // Plus aucun type de modale à gérer ne doit être défini
    setModalType(null);

    // On met à jour le state contenant les erreurs qu'auraient pu être affichée dans la modale
    setErrors([]);
  };

  const toggleSortOrder = (columnValue) => {
    // Copie des données du cache
    console.log('columnValue : ', columnValue);
    const cachedData = name === 'users'
      ? [...cache['http://localhost:8000/api/users']['hydra:member']]
      : [...cache['http://localhost:8000/api/ingredients']['hydra:member']];

    console.log('cachedData : ', cachedData);
    const sortedData = cachedData.sort((a, b) => {
      let aValue;
      let bValue;

      if (name === 'users' && (columnValue === 'hireDate' || columnValue === 'endDate')) {
        // Convertir les chaînes de date en objets Date
        aValue = new Date(a[columnValue]);
        bValue = new Date(b[columnValue]);

        // Gérer les dates non définies
        if (Number.isNaN(aValue)) {
          aValue = new Date('9999-12-31'); // Placer les dates non définies à la fin
        }
        if (Number.isNaN(bValue)) {
          bValue = new Date('9999-12-31'); // Placer les dates non définies à la fin
        }
      } else {
        // Si ce n'est pas une date, utiliser directement la valeur
        aValue = Object.prototype.hasOwnProperty.call(a, columnValue) ? a[columnValue] : '';
        bValue = Object.prototype.hasOwnProperty.call(b, columnValue) ? b[columnValue] : '';
      }

      // Vérifier si les valeurs sont des nombres ou des dates
      if ((typeof aValue === 'number' || aValue instanceof Date) && (typeof bValue === 'number' || bValue instanceof Date)) {
        // Si les deux valeurs sont des nombres ou des dates, les trier en fonction de l'ordre numérique ou chronologique
        if (['asc', ''].includes(sortOrders[columnValue])) {
          return aValue - bValue;
        }
        return bValue - aValue;
      }
      // Sinon, trier les valeurs en utilisant localeCompare pour les chaînes de caractères
      if (['desc', ''].includes(sortOrders[columnValue])) {
        return aValue.toString().localeCompare(bValue.toString());
      }
      return bValue.toString().localeCompare(aValue.toString());
    });

    // Mettre à jour le cache et les états de tri
    const apiUrl = name === 'users' ? 'http://localhost:8000/api/users' : 'http://localhost:8000/api/ingredients';
    const updatedCacheData = name === 'users'
      ? { ...cache['http://localhost:8000/api/users'], 'hydra:member': sortedData }
      : { ...cache['http://localhost:8000/api/ingredients'], 'hydra:member': sortedData };

    updateCache(apiUrl, updatedCacheData);

    setSortOrders((prevSortOrders) => ({
      ...prevSortOrders,
      [columnValue]: prevSortOrders[columnValue] === 'asc' || prevSortOrders[columnValue] === '' ? 'desc' : 'asc',
    }));
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
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      };

      // Requête l'API permettant la récupération de la liste des User et entraînant la construction du cache de ces derniers
      const { data } = await fetchData(`http://localhost:8000/api/${name}`, options);

      // Si aucune donnée n'est retournée
      if (!data) {
        // On retire le loading
        setIsLoading(false);

        // On ne fait rien de plus et on sort de la méthode
        return;
      }

      // Je récupère toutes les informations pertinentes concernant mes Users
      setEntries(data['hydra:member'].map((entry) => ({
        ...entry,
      })));

      // Les données nécessaires à l'affichage ont été récupérées. Je retire le loading
      setIsLoading(false);
    };

    fechDataAsync();
  /*
    React me conseille de mettre un certain nombre de dépendances or le useeffect ne doit se
    déclencher que si les modales indiquent la réussite de leur requête associée. Je retire donc l'avertissement
  */
  }, [reloadData, sortOrders]);

  console.log('sortOrder : ', sortOrders);
  return (
    <>
      <SpinnerWrapper $showSpinner={isLoading} />
      <Container fluid className="pt-4 px-4">
        <div className="bg-secondary text-center rounded p-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            {name === 'users'
                && <h6 className="mb-0">Liste des utilisateurs</h6>}
            {name === 'ingredients'
                && <h6 className="mb-0">Liste des ingrédients</h6>}
          </div>
          <div className="table-responsive">
            <Table className="text-start align-middle table-bordered table-hover mb-0">
              <thead>
                <tr className="text-white">
                  {((authPermissions.includes('Suppression des employés') && name === 'users')
                        || (authPermissions.includes('Suppression des ingrédients') && name === 'ingredients'))
                        && <th scope="col" />}
                  {((name === 'users' || name === 'ingredients')
                    && <th scope="col" className="text-center">Nom</th>
                    )}

                  {Object.entries(displayedColumns).map(([columnValue, isActive]) => isActive && (
                  <th key={columnValue} scope="col" className={`text-center ${columnNameToSort.includes(columnValue) ? 'sortable' : ''}`} onClick={columnNameToSort.includes(columnValue) ? () => toggleSortOrder(columnValue) : null}>
                    <div className="d-inline-block  me-2 align-middle">
                      {getLabelForColumn(columnValue)}
                    </div>

                    {columnNameToSort.includes(columnValue)
                        && (
                        <div className="d-inline-block">
                          <FontAwesomeIcon icon={faSortDesc} />
                        </div>
                        )}
                  </th>
                  ))}
                  {((authPermissions.includes('Mise à jour des informations des employés') && name === 'users')
                        || (authPermissions.includes('Mise à jour des ingrédients') && name === 'ingredients'))
                        && <th scope="col" />}
                </tr>
              </thead>

              <tbody>

                {/*
                  La méthode map itère sur chaque élément du tableau 'entries'
                  et applique une fonction à chaque 'user'
                */}
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    {(() => {
                      // Vérifie si l'utilisateur a la permission de supprimer des employés et si le nom est 'users'
                      if (authPermissions.includes('Suppression des employés') && name === 'users') {
                        // Vérifie si l'utilisateur courant n'est pas l'utilisateur actuel dans la boucle
                        const isCurrentUser = authUser === entry.username;

                        // Si ce n'est pas l'utilisateur courant, affichez la case à cocher
                        return !isCurrentUser ? (
                          <td className="text-center">
                            <Form.Check
                              type="checkbox"
                              onChange={() => handleCheckboxChange(entry.username)}
                              checked={selectedEntries.includes(entry.username)}
                            />
                          </td>
                        ) : (
                        // Sinon, affichez une cellule vide
                          <td />
                        );
                      }
                      // Si l'utilisateur n'a pas la permission ou si le nom n'est pas 'users', retournez null
                      return null;
                    })()}
                    {authPermissions.includes('Suppression des ingrédients') && name === 'ingredients' && (
                    <td className="text-center">
                      <Form.Check
                        type="checkbox"
                        onChange={() => handleCheckboxChange(entry.title)}
                        checked={selectedEntries.includes(entry.title)}
                      />
                    </td>
                    )}
                    <td className={`text-center ${name === 'ingredients' ? getTextColorClass(entry.percentQuantity) : ''}`}>
                      {(() => {
                        if (name === 'users') {
                          return entry.realName;
                        } if (name === 'ingredients') {
                          return entry.title;
                        }
                        return '';
                      })()}
                    </td>
                    {Object.entries(displayedColumns).map(([columnKey, isActive]) => (
                      isActive && (
                        <td key={columnKey} className={`text-center ${name === 'ingredients' ? getTextColorClass(entry.percentQuantity) : ''}`}>
                          {getColumnValue(entry, columnKey)}
                        </td>
                      )
                    ))}

                    {((authPermissions.includes('Mise à jour des informations des employés') && name === 'users')
                        || (authPermissions.includes('Mise à jour des ingrédients') && name === 'ingredients')) && (
                        <td className="text-center">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleEditClick(entry)}
                          >
                            Modifier
                          </Button>
                        </td>
                    )}
                  </tr>
                ))}

              </tbody>
            </Table>
          </div>

          <div className="d-flex justify-content-center mt-4">
            {((authPermissions.includes('Inscription de nouveaux employés') && name === 'users')
            || (authPermissions.includes('Inscription de nouveaux ingrédients') && name === 'ingredients'))
            && (
            <Button
              variant="success"
              size="sm"
              className="me-4"
              onClick={() => handleAddClick()}
            >
              Ajouter
            </Button>
            )}

            {((authPermissions.includes('Suppression des employés') && name === 'users')
                || (authPermissions.includes('Suppression des ingrédients') && name === 'ingredients'))
            && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleDeleteClick()}
              disabled={selectedEntries.length === 0}
            >
              Supprimer
            </Button>
            )}
          </div>

        </div>

        <Dropdown show={showDropdown} className="mt-4 d-flex justify-content-center">
          <Dropdown.Toggle variant="info" size="sm" id="dropdown-basic" onClick={handleToggle}>
            Informations à afficher
          </Dropdown.Toggle>

          <Dropdown.Menu className="ps-3 pe-3" style={{ width: '167px', fontSize: '.875rem' }}>
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
          (name === 'users' && (
          <UserAddAndEditModal
            handleClose={handleModalClose}
            handleSuccess={() => {
              setReloadData(!reloadData);
            }}
            user={selectedEntry}
          />
          ))
          || (name === 'ingredients' && (
          <GenericAddAndEditModal
            name={name}
            handleClose={handleModalClose}
            handleSuccess={() => {
              setReloadData(!reloadData);
            }}
            selectedEntry={selectedEntry}
          />
          )))}

        {modalOpen && modalType === 'delete' && (
          <GenericDeleteModal
            name={name}
            selectedEntries={selectedEntries}
            setSelectedEntries={setSelectedEntries}
            handleClose={handleModalClose}
            handleSuccess={() => {
              setReloadData(!reloadData);
            }}
          />
        )}
      </Container>
    </>
  );
}

GenericTable.propTypes = {
  name: propTypes.string.isRequired,
  displayedColumns: propTypes.shape({
    username: propTypes.bool.isRequired,
    roles: propTypes.bool.isRequired,
    phoneNumber: propTypes.bool.isRequired,
    email: propTypes.bool.isRequired,
    hireDate: propTypes.bool.isRequired,
    endDate: propTypes.bool.isRequired,
    employmentStatus: propTypes.bool.isRequired,
    socialSecurityNumber: propTypes.bool.isRequired,
    comments: propTypes.bool.isRequired,
  }).isRequired,
  setDisplayedColumns: propTypes.func.isRequired,
};

export default GenericTable;
