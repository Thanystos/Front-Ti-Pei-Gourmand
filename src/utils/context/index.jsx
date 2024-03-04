import { jwtDecode } from 'jwt-decode';
import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // Les states qui seront partagés entre mes composants
  const [authToken, setAuthToken] = useState('');
  const [authRoles, setAuthRoles] = useState('');
  const [authUser, setAuthUser] = useState('');

  const updateUserAuth = (authToken, authRoles = null, authUser = null, isRetrievedFromLS = false) => {
    
    // Si on ne possède ni les authRoles ni les authUser
    if (!authRoles && !authUser) {

      // On ne set le token dans le LS que si il n'y existe pas encore
      if(!isRetrievedFromLS) {

        // Stockage de l'objet authToken dans le LocalStorage
        localStorage.setItem('authToken', authToken);
      }
      
      // Récupération des rôles associés au token
      const decodedToken = jwtDecode(authToken);
      authRoles = decodedToken.roles || '';
      console.log('Nouveaux authRoles : ', authRoles);

      // Récupération du username associé au token
      authUser = decodedToken.username;
    }

    setAuthToken(authToken);
    setAuthRoles(authRoles);
    setAuthUser(authUser);
  };

  /* Permet de récupérer le token d'id et les authRoles 
     dans le LS en cas de rechargement de l'application
  */
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      updateUserAuth(storedToken, null, null, true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authToken, authRoles, authUser, updateUserAuth, }}>
      {children}
    </AuthContext.Provider>
  );
};

export const CacheContext = createContext();

export const CacheProvider = ({ children }) => {

  // State contenant la réponse de mes requêtes GET
  const [cache, setCache] = useState({});

  // Méthode, à partager, permettant de mettre à jour le contenu de la réponse pour la ressource identifiée par l'url
  const updateCache = (url, data) => {
    
      setCache(prevCache => ({
        ...prevCache,
        [url]: data,
      }));
  }

  return (
    <CacheContext.Provider value={{ cache, updateCache }} >
      {children}
    </CacheContext.Provider>
  );
};