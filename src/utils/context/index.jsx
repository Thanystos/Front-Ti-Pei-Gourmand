import { createContext, useState } from 'react';
import { useApiRequest, useAssociativeEntityUpdater, useAuth, useCache, useModal }  from '../hooks';
import SpinnerWrapper from '../../composants/SpinnerWrapper';

export const ApiContext = createContext();

// Permet de partager mes Hooks et States entre mes composants
export const ApiProvider = ({ children }) => {

  // State permettant de gérer l'affichage du loading
  const [isLoading, setIsLoading] = useState(false);

  // Hook permettant la construction du cache
  const { cache, updateCache } = useCache();

  // Hook permettant l'appel à l'API et se servant du hook du cache pour construire ce dernier une fois la réponse obtenue
  const { errors, setErrors, fetchData } = useApiRequest(cache, updateCache);

  // Hook permettant la mise à jour des informations du User connecté en se servant du cache qu'il devra parfois mettre à jour grâce au hook d'appel API
  const { authToken, authRoles, authUser, authPermissions, updateUserAuth } = useAuth(setIsLoading, cache, fetchData);

  // Hook permettant de requêter l'API et d'enregistrer ou de supprimer des associations d'entités entraînant parfois la mise à jour des informations du User connecté
  const { isArraySuperset, updateAssociativeEntity } = useAssociativeEntityUpdater(fetchData, authToken, updateUserAuth);

  //console.log('Montage du Provider');
  return (
    <ApiContext.Provider value={{ isLoading, setIsLoading, cache, updateCache, errors, setErrors, fetchData, authToken, authRoles, authUser, authPermissions, updateUserAuth, isArraySuperset, updateAssociativeEntity }}>
      
      {children}
    </ApiContext.Provider>
  );
};


export const ModalManagementContext = createContext();

export const ModalManagementProvider = ({ children }) => {

  // Hook chargé de gérer l'état des modales
  const { handleSuccessInModal } = useModal();

  return (
    <ModalManagementContext.Provider value={{ handleSuccessInModal }}>
      {children}
    </ModalManagementContext.Provider>
  );
};