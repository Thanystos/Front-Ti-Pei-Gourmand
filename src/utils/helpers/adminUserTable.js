import { differenceInMonths } from "date-fns";

// Convertit le nom de mes colonnes en une version plus adapté à l'affichage
export const getLabelForColumn = (columnName) => {
    switch (columnName) {
      case 'username':
        return 'Pseudonyme';
      case 'phoneNumber':
        return 'Téléphone';
      case 'email':
        return 'E-mail';
      case 'hireDate':
        return 'Ancienneté';
      case 'roles':
        return 'Roles';
      case 'endDate':
        return 'Fin du contrat';
      case 'employmentStatus':
        return 'Type de contrat';
      case 'socialSecurityNumber':
        return 'N° Sécu';
      case 'comments':
        return 'Commentaires';
      default:
        return '';
    }
  };

// Calcule le nombre de mois entre l'embauche et la date actuelle
export const calculateMonthsOfService = (hireDate) => {
  const currentDate = new Date();
  const difference = differenceInMonths(currentDate, hireDate);

  return isNaN(difference) ? '' : difference + ' mois';
}

// Permet de récupérer le nom de tous les rôles d'un utilisateur
export const getRolesName = (user) => {
  if (user && user.userRoles && user.userRoles.length > 0) {
    return user.userRoles

      // Pour éviter de modifier l'ordre des éléments dans le tableau d'origine
      .slice() 

      // Tri par l'ID du rôle de manière ascendante
      .sort((a, b) => a.role.id - b.role.id) 
      .map(userRole => userRole.role.name);
  }
  return [];
};


// Permet de déterminer la valeur à renvoyer en cas de problème
export const getDefaultIfUndefined = (value) => (value !== undefined) && (value !== '') ? value : 'À définir';

export const getColumnValue = (user, column) => {
    switch (column) {
      case 'username':
        return user.username;
      case 'realName':
        return user.realName;
      case 'phoneNumber':
        return user.phoneNumber;
      case 'email':
        return user.email;
      case 'hireDate':
        return getDefaultIfUndefined(calculateMonthsOfService(user.hireDate));
      case 'roles':
        return getRolesName(user).join(' / ');
      case 'endDate':
        return getDefaultIfUndefined(user.endDate) !== 'À définir'
          ? new Date(user.endDate).toLocaleDateString()
          : 'À définir';
      case 'employmentStatus':
        return getDefaultIfUndefined(user.employmentStatus);
      case 'socialSecurityNumber':
        return getDefaultIfUndefined(user.socialSecurityNumber);
      case 'comments':
        return getDefaultIfUndefined(user.comments);
      default:
        return '';
    }
  };