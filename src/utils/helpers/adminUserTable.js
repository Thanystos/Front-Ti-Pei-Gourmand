import { differenceInMonths } from "date-fns";

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

// Convertit les roles en bdd en texte plus convivial pour de l'affichage
export const mapRoles = (roles) => {
    return roles.map(role => {
      switch (role) {
        case 'ROLE_ADMIN':
          return 'Admin';
        case 'ROLE_CUISINIER':
          return 'Cuisinier';
        default:
          return role;
      }
    }).join(' / ');
}

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
        return mapRoles(user.roles);
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