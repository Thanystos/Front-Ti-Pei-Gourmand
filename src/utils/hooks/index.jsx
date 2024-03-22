/* eslint-disable max-len */
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
// eslint-disable-next-line import/no-cycle
import { ApiContext, ModalManagementContext } from '../context';
import { methodSelection } from '../helpers/hook';
import errorMessages from '../errors';

// Hook permettant de requêter l'API
export const useApiRequest = (cache, updateCache) => {
  // State contenant les messages d'erreur renvoyés par l'API
  const [errors, setErrors] = useState([]);

  // Permet la redirection
  const navigate = useNavigate();

  // Méthode requêtant l'API, modifiant le cache et renvoyant la réponse au composant y faisant appel
  const fetchData = async (url, options, isLogin = false) => {
    // Si j'effectue une requête GET mais que le cache contient déjà les informations associées
    if (options.method === 'GET' && cache[url]) {
      // Je retourne ces dernières afin de ne pas interroger le serveur pour rien
      return { data: cache[url] };
    }

    // On récupére la réponse renvoyée par le serveur
    const response = await fetch(url, options);

    // On récupère les données associées à cette réponse
    const data = await response.json();

    // Si la réponse indique que la requête a échoué
    if (!response.ok) {
      // Si je ne suis pas actuellement sur la page de Login
      if (!isLogin) {
        // Si le code de cette réponse correspond à l'expiration du token
        if (response.status === 401) {
          // Je redirige le User vers le Login en lui indiquant que son token a expiré
          navigate('/login', { state: { errorMessage: 'Votre session a expiré. Veuillez vous reconnecter.' } });
        }

        // Je mets à jour mon state dédié aux erreurs
        setErrors(data.error ?? data.errors);

        // Je renvoie des données génériques au composant ayant fait l'appel au hook
        return { data: '', response: '' };
      }
      // Si je sur la page Login, on détermine le type d'erreur à afficher
      const errorMessage = response.status === 401 ? errorMessages.invalidCredentials : errorMessages.serverError;

      // Je mets à jour mon state dédié aux erreurs
      setErrors([errorMessage]);
    }

    // Construit et retourne le contenu du cache pour la ressource manipulée par le serveur
    return methodSelection(url, data, response, cache, updateCache, options);
  };

  return { errors, setErrors, fetchData };
};

export default useApiRequest;

// Hook permettant de gérer le comportement de mes modales
export const useModal = () => {
  // Définit le comportement de mes modales au moment de la validation de ces dernières
  const handleSuccessInModal = (response, handleClose, handleSuccess, setIsLoading) => {
    /*
      Si la réponse liée à l'opération associée à la validation de la modale
      indique que la requête a réussi
    */
    if (response && response.ok) {
      // Je ferme cette dernière
      handleClose();

      // Le traitement terminé, je retire le loading
      setIsLoading(false);

      // Je recharge le parent
      handleSuccess();
    }
  };
  return { handleSuccessInModal };
};

// Hook permettant de requêter l'API et d'enregistrer ou de supprimer des associations d'entités
export const useAssociativeEntityUpdater = (fetchData, authToken, updateUserAuth) => {
  // Méthode indiquant si deux tableaux contiennent les mêmes éléments
  const isArraySuperset = (initialsecondEntityIds, secondEntityIds) => secondEntityIds.every((elem) => initialsecondEntityIds.includes(elem));

  // Méthode permettant de requêter l'API et d'enregistrer ou de supprimer des associations d'entités
  const updateAssociativeEntity = async (associativeEntityName, firstEntityId, secondEntityIds, initialsecondEntityIds, isUserFirstEntity = false) => {
    console.log('fetchdata : ', fetchData);
    // Si le tableau de départ (avant ajustement des associations) est différent du tableau final (après ajustement des associations)
    if (!isArraySuperset(initialsecondEntityIds, secondEntityIds) || !isArraySuperset(secondEntityIds, initialsecondEntityIds)) {
      // Détermine les entités ajoutés (présents dans secondEntityIds mais pas dans initialsecondEntity)
      const entitiesToAdd = secondEntityIds.filter((secondEntityId) => !initialsecondEntityIds.includes(secondEntityId));

      // Détermine les entités retirés (présents dans initialsecondEntity mais pas dans secondEntityIds)
      const entitiesToRemove = initialsecondEntityIds.filter((initialsecondEntityId) => !secondEntityIds.includes(initialsecondEntityId));

      // Si il y a de nouvelles associations d'entités à ajouter
      if (entitiesToAdd.length > 0) {
        const userRolePostOptions = {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'content-type': 'application/ld+json',
          },
          body: JSON.stringify({
            firstEntityId,
            secondEntityIds: [...entitiesToAdd],

            // Un token d'id sera généré par l'API à la dernière requête. On lui indique donc si c'est le cas
            isLastMethod: isUserFirstEntity
              ? entitiesToRemove.length === 0
              : false,
          }),
        };

        // On requête l'API pour inscrire la ou les nouvelle(s) association(s) d'entités
        const { data: roleAddData } = await fetchData(`http://localhost:8000/api/${associativeEntityName}`, userRolePostOptions);

        // Si l'API a fourni un nouveau token d'id
        if (roleAddData.token ?? false) {
          // On met à jour nos informations relatives au User connecté
          updateUserAuth(roleAddData.token);
        }
      }

      // Si des associations d'entités sont à supprimer
      if (entitiesToRemove.length > 0) {
        const userRoleDeleteOptions = {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'content-type': 'application/ld+json',
          },
          body: JSON.stringify({
            firstEntityId,
            secondEntityIds: [...entitiesToRemove],
          }),
        };

        // On requête l'API pour retirer la ou les ancienne(s) association(s) d'entités
        const { data: roleDeleteData } = await fetchData(`http://localhost:8000/api/${associativeEntityName}`, userRoleDeleteOptions);

        // Si l'API a fourni un nouveau token d'id
        if (roleDeleteData.token ?? false) {
          // On met à jour nos informations relatives au User connecté
          updateUserAuth(roleDeleteData.token);
        }
      }
    }
  };

  return { isArraySuperset, updateAssociativeEntity };
};

// Hook permettant la gestion du cache
export const useCache = () => {
  // State contenant les informations de mes entités
  const [cache, setCache] = useState({});

  // Méthode permettant de mettre à jour les informations pour mes entités identifiées par l'url
  const updateCache = (url, data) => {
    setCache((prevCache) => ({
      ...prevCache,
      [url]: data,
    }));
  };

  return { cache, updateCache };
};

export const useAuth = (setIsLoading, cache, fetchData) => {
  // States contenant les informations relatives au User connecté
  const [authToken, setAuthToken] = useState('');
  const [authUser, setAuthUser] = useState('');
  const [authRoles, setAuthRoles] = useState([]);
  const [authPermissions, setAuthPermissions] = useState([]);

  // Méthode permettant la mise à jour des informations relatives au User connecté
  const updateUserAuth = async (initialAuthToken, initialAuthRoles = [], initialAuthUser = null, isRetrievedFromLS = false) => {
    console.log('2');

    const token = initialAuthToken;
    let roles = [...initialAuthRoles];
    let user = initialAuthUser;

    const rolesOptions = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    /*
      Requête l'API et entraîne la construction du cache des rôles
      Ce cache est nécessaire pour obtenir les permissions accordées au User connecté
    */
    await fetchData('http://localhost:8000/api/roles', rolesOptions);

    // Si on ne possède pas les informations sur le User connecté
    if (roles.length === 0 && !user) {
      // Si le token n'est pas enregistré dans le LocalStorage
      if (!isRetrievedFromLS) {
        // On stocke ce dernier
        localStorage.setItem('token', token);
      }

      // À partir de ce token on peut en déduire les informations associées
      const decodedToken = jwtDecode(token);

      // Username associé au token
      user = decodedToken.username;

      // Roles associés au token
      roles = decodedToken.roles || '';
    }

    // On peut à présent mettre à jour nos states avec les informations récupéréess
    setAuthToken(token);
    setAuthRoles(roles);
    setAuthUser(user);
  };

  /*
    Se déclenche quand le state contenant les rôles change.
    Détermine les permissions associées aux nouveaux rôles
  */
  useEffect(() => {
    // Retourne un tableau contenant l'ensemble des permissions accordées au User connecté
    const getPermissionsForRoles = () => {
      // Contient le cache des rôles contenant les informations de tous ces derniers
      const rolesCollection = cache['http://localhost:8000/api/roles'];

      // Si ce cache existe (devrait toujours être vraie)
      if (rolesCollection ?? false) {
        console.log('4');

        // Contiendra toutes les permissions accordées au User connecté. Un ensemble empêche les doublons
        const permissionsSet = new Set();

        // Pour chaque rôle contenu dans mon tableau
        authRoles.forEach((authRole) => {
          // Je récupère les informations de ce dernier dans le cache des rôles
          const roleName = rolesCollection['hydra:member'].find((role) => role.name === authRole);
          // Si j'ai bien trouvé ce dernier dans le cache des rôles
          if (roleName) {
            console.log('4.1');
            // Pour chaque permission associée
            roleName.rolePermissions.forEach((rolePermission) => {
              // J'ajoute ces dernières dans l'ensemble des permissions
              permissionsSet.add(rolePermission.permission.name);
            });
          }
        });

        // Je convertis et retourne l'ensemble en tableau
        return Array.from(permissionsSet);
      }
      return [];
    };

    // Si les authRoles existent (empêche d'effectuer la logique au montage initial)
    if (authRoles.length > 0) {
      console.log('3');

      // Mets à jour les permissions accordées au User connecté
      setAuthPermissions(getPermissionsForRoles());
    }
  }, [authRoles, cache['http://localhost:8000/api/roles']]);

  /*
    Se déclenche quand le state contenant les permissions change.
    Fin du processus de récupération des nouvelles informations de l'utilisateur connecté
  */
  useEffect(() => {
    console.log('5');

    // Si les authPermissions existent (empêche d'effectuer la logique au montage initial)
    if (authPermissions.length > 0) {
      console.log('6');

      // Le processus de récupération des informations est terminé, je retire le loading
      setIsLoading(false);
    }
  }, [authPermissions]);

  /*
    Se déclenche au montage initial de l'application.
    Permet de déclencher le processus de récupération des informations du User connecté
  */
  useEffect(() => {
    console.log('7');

    // Je récupère le token d'id dans le LocalStorage
    const storedToken = localStorage.getItem('authToken');

    // Si il existe je peux lancer le processus
    if (storedToken) {
      console.log('8');

      updateUserAuth(storedToken, [], null, true);
    } else {
      setIsLoading(false);
    }
  }, []);

  return {
    authToken, authRoles, authUser, authPermissions, updateUserAuth,
  };
};

// Hook permettant d'accéder aux informations partagées par le context ApiContext
export const useApi = () => {
  const {
    isLoading, setIsLoading, cache, updateCache, errors, setErrors, fetchData, authToken, authRoles, authUser, authPermissions, updateUserAuth, isArraySuperset, updateAssociativeEntity,
  } = useContext(ApiContext);
  return {
    isLoading, setIsLoading, cache, updateCache, errors, setErrors, fetchData, authToken, authRoles, authUser, authPermissions, updateUserAuth, isArraySuperset, updateAssociativeEntity,
  };
};

export const useModalManagement = () => {
  const { handleSuccessInModal } = useContext(ModalManagementContext);
  return { handleSuccessInModal };
};
