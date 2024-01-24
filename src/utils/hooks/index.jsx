import { useContext, useState } from "react";
import { AuthContext } from "../context";
import { useNavigate } from "react-router-dom";

// Hook permettant de requêter l'API
export const useApiRequest = (initialLoading = false) => {

  // Permet d'afficher le loader. On contrôle son comportement par défaut avec initialLoading
  const [isLoading, setIsLoading] = useState(initialLoading);

  // Permet d'afficher les erreurs renvoyées par le serveur
  const [error, setError] = useState();

  // State empêchant l'affichage des données au chargement de la page
  const [isRedirected, setIsRedirected] = useState(true);

  // Permet la redirection
  const navigate = useNavigate();

  // Méthode permettant la requête à l'API
  const fetchData = async (url, options) => {

    /*
      Utile quand la valeur par défaut du loading est à false 
      OU
      Quand mes données sont disponibles et que je relance la requête (causée par isRedirected)
      mais que le loading est alors à ce moment passé false
    */
    setIsLoading(true);

    try {

      // On récupére la réponse renvoyée par le serveur
      const response = await fetch(url, options);

      // On récupère les données associées à cette réponse
      const data = await response.json();

      // Si la réponse indique que la requête a échoué
      if (!response.ok) {

        // Si le code de cette réponse correspond à l'expiration du token
        if(response.status === 401) {

          // On renvoie l'utilisateur sur la page d'accueil
          navigate('/login', { state : { errorMessage: 'Votre session a expiré. Veuillez vous reconnecter.' } })
        }

          // Pour toutes autres erreurs, on la lève et on la rattrape plus loin
          throw new Error(data.error || data.errors || 'Une erreur inattendue est survenue.');
        
      }
      
      /* 
        La requête ayant réussi, on va relancer cette dernière et on permettra, 
        cette fois, l'affichage des données
      */
      setIsRedirected(false);

      // La requête a abouti, on peut retirer le loading
      setIsLoading(false);

      // On retourne les données et la réponse
      return { data, response };

      // On rattrape toutes les erreurs levées
    } catch (error) {

      // La requête a abouti, on peut retirer le loading
      setIsLoading(false);

      // On va renvoyer le message de l'erreur qui a été levée
      setError(error.message);

      // On renvoie des données vides et une réponse null
      return { data: '', response: null };
    }
  };

  // Définit le comportement au moment de la validation de la modale
  const handleSuccessInModal = ({ response }, handleClose, handleSuccess) => {
    
    /* 
      Si la réponse liée à l'opération associée à la validation de la modale 
      indique que la requête a réussi
    */
    if (response && response.ok) {

      // Je fermerai cette dernière
      handleClose();

      // Je "rechargerai la page
      handleSuccess();
    }
  }

  return { isLoading, error, fetchData, handleSuccessInModal, isRedirected };
};

export default useApiRequest;

// Hook permettant d'accéder aux informations partagées par le context AuthContext
export const useAuth = () => {
  const { authToken, authRoles, authUser, updateUserAuth }  = useContext(AuthContext);
  return { authToken, authRoles, authUser, updateUserAuth }
};