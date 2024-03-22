/* eslint-disable max-len */
import {
  React, createContext, useMemo, useState,
} from 'react';
import { propTypes } from 'prop-types';
// eslint-disable-next-line import/no-cycle
import {
  useApiRequest, useAssociativeEntityUpdater, useAuth, useCache, useModal,
} from '../hooks';
import SpinnerWrapper from '../../composants/SpinnerWrapper';

export const ApiContext = createContext();

// Permet de partager mes Hooks et States entre mes composants
export function ApiProvider({ children }) {
  // State permettant de gérer l'affichage du loading
  const [isLoading, setIsLoading] = useState(true);

  // Hook permettant la construction du cache
  const { cache, updateCache } = useCache();

  // Hook permettant l'appel à l'API et se servant du hook du cache pour construire ce dernier une fois la réponse obtenue
  const { errors, setErrors, fetchData } = useApiRequest(cache, updateCache);

  // Hook permettant la mise à jour des informations du User connecté en se servant du cache qu'il devra parfois mettre à jour grâce au hook d'appel API
  const {
    authToken, authRoles, authUser, authPermissions, updateUserAuth,
  } = useAuth(setIsLoading, cache, fetchData);

  // Hook permettant de requêter l'API et d'enregistrer ou de supprimer des associations d'entités entraînant parfois la mise à jour des informations du User connecté
  const { isArraySuperset, updateAssociativeEntity } = useAssociativeEntityUpdater(fetchData, authToken, updateUserAuth);

  const contextValue = useMemo(() => ({
    isLoading,
    setIsLoading,
    cache,
    updateCache,
    errors,
    setErrors,
    fetchData,
    authToken,
    authRoles,
    authUser,
    authPermissions,
    updateUserAuth,
    isArraySuperset,
    updateAssociativeEntity,
  }), [isLoading, cache, errors, authToken, authRoles, authUser, authPermissions]);

  return (
    <ApiContext.Provider value={contextValue}>
      <SpinnerWrapper $showSpinner={isLoading} />
      {children}
    </ApiContext.Provider>
  );
}

ApiProvider.propTypes = {
  children: propTypes.node.isRequired,
};

export const ModalManagementContext = createContext();

export function ModalManagementProvider({ children }) {
  // Hook chargé de gérer l'état des modales
  const { handleSuccessInModal } = useModal();

  const contextValue = useMemo(() => ({
    handleSuccessInModal,
  }), [handleSuccessInModal]);

  return (
    <ModalManagementContext.Provider value={contextValue}>
      {children}
    </ModalManagementContext.Provider>
  );
}

ModalManagementProvider.propTypes = {
  children: propTypes.node.isRequired,
};
