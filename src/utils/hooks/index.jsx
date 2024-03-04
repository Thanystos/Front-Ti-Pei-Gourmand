import { useContext, useState } from "react";
import { AuthContext } from "../context";
import { CacheContext } from "../context";
import { useNavigate } from "react-router-dom";
import { methodSelection } from "../helpers/hook";
import { errorMessages } from "../errors";

// Hook permettant de requêter l'API
export const useApiRequest = () => {

  const { updateCache, cache } = useCache();
  console.log('état de mon cache : ', cache);

  // Permet d'afficher les erreurs renvoyées par le serveur
  const [errors, setErrors] = useState([]);

  // Permet la redirection
  const navigate = useNavigate();

  // Méthode permettant la requête à l'API
  const fetchData = async (url, options, isLogin = false) => {

    // Si je cherche à obtenir des informations à afficher et qu'elles sont déjà présentes dans le cache
    if (options.method === 'GET' && cache[url]) {
      console.log('cache GET récupéré');

      // On récupère ces informations dans le cache afin de ne pas refaire la requête
      return { data: cache[url] };
    }

    // On récupére la réponse renvoyée par le serveur
    const response = await fetch(url, options);

    // On récupère les données associées à cette réponse
    const data = await response.json();

    // Séparer en mettant dans helpers ?
    // Si la réponse indique que la requête a échoué
    if (!response.ok) {
      if (!isLogin) {

        // Si le code de cette réponse correspond à l'expiration du token
        if (response.status === 401) {

          // Si l'utilisateur n'est pas déjà sur la page Login, On le renvoie sur cette dernière
          navigate('/login', { state: { errorMessage: 'Votre session a expiré. Veuillez vous reconnecter.' } });
        }

        // On récupère les erreurs envoyées par le serveur
        setErrors(data.error ?? data.errors);
        return {data: '', response: ''};
      } else {

        // Si on est sur la page login, on set le message d'erreur en fonction du code d'erreur reçu du serveur
        const errorMessage = response.status === 401 ? errorMessages.invalidCredentials : errorMessages.serverError;
        setErrors([errorMessage]);
      }
    }

    // Permet la construction du cache
    return methodSelection(url, data, response, cache, updateCache, options);
  };

  return { errors, fetchData };
};

export default useApiRequest;

export const useModal = () => {

  // Définit le comportement au moment de la validation de la modale
  const handleSuccessInModal = (response, handleClose, handleSuccess, setIsLoading) => {
    
    console.log('1')
    /* 
      Si la réponse liée à l'opération associée à la validation de la modale 
      indique que la requête a réussi
    */
    if (response && response.ok) {
      console.log('2')

      // Je fermerai cette dernière
      handleClose();

      // Je rechargerai la page
      handleSuccess();

      setIsLoading(false);
    }
  };
  
  return { handleSuccessInModal };
};

// Hook permettant d'accéder aux informations partagées par le context AuthContext
export const useAuth = () => {
  const { authToken, authRoles, authUser, updateUserAuth }  = useContext(AuthContext);
  return { authToken, authRoles, authUser, updateUserAuth };
};

// Hook permettant d'accèder au résultat des requêtes mises en cache
export const useCache = () => {
  const { cache, updateCache } = useContext(CacheContext);
  return { cache, updateCache }
}