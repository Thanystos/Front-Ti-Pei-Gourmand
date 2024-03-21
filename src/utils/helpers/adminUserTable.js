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

      /* -------------------------------------------------- */

      case 'quantity':
        return 'Quantité';
      case 'percentQuantity':
        return '%';
      case 'unit':
        return 'Unité';
      case 'category':
        return 'Catégorie';
      case 'isAllergen':
        return 'Allergène ?';
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

export const getColumnValue = (entry, column) => {
    switch (column) {
      case 'username':
        return entry.username;
      case 'realName':
        return entry.realName;
      case 'phoneNumber':
        return entry.phoneNumber;
      case 'email':
        return entry.email;
      case 'hireDate':
        return getDefaultIfUndefined(calculateMonthsOfService(entry.hireDate));
      case 'roles':
        return getRolesName(entry).join(' / ');
      case 'endDate':
        return getDefaultIfUndefined(entry.endDate) !== 'À définir'
          ? new Date(entry.endDate).toLocaleDateString()
          : 'À définir';
      case 'employmentStatus':
        return getDefaultIfUndefined(entry.employmentStatus);
      case 'socialSecurityNumber':
        return getDefaultIfUndefined(entry.socialSecurityNumber);
      case 'comments':
        return getDefaultIfUndefined(entry.comments);

      /* -------------------------------------------------- */

      case 'title':
        return entry.title;
      case 'quantity':
        return entry.quantity + ' / ' + entry.maxQuantity;
      case 'percentQuantity':
        return entry.percentQuantity;
      case 'unit':
        return entry.unit;
      case 'category':
        return entry.category;
      case 'isAllergen':
        return entry.isAllergen ? 'Oui' : 'Non';
      default:
        return '';
    }
  };

export const getTextColorClass = (percentQuantity) => {
  if (percentQuantity >= 50) {
    return 'text-success'; // Vert
  } else if (percentQuantity > 20) {
    return 'text-warning'; // Jaune
  } else {
    return 'text-danger'; // Rouge
  }
};