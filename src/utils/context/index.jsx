import { jwtDecode } from 'jwt-decode';
import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // Les states qui seront partagés entre mes composants
  // Les states qui seront partagés entre mes composants
  const [authToken, setAuthToken] = useState('');
  const [authRoles, setAuthRoles] = useState('');
  const [authUser, setAuthUser] = useState('');

  // La méthode qui sera partagée entre mes composants
  const updateUserAuth = (authToken, authRoles, authUser) => {
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
      const decodedToken = jwtDecode(storedToken);
      const storedRoles = decodedToken.roles || '';
      const storedUser = decodedToken.username;
      updateUserAuth(storedToken, storedRoles, storedUser);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authToken, authRoles, authUser, updateUserAuth }}>
      {children}
    </AuthContext.Provider>
  );
};