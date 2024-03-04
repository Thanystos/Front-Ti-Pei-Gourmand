export const getUserRoles = (user) => {
  if (user && user.userRoles && user.userRoles.length > 0) {
    return user.userRoles.map(userRole => ({ id: userRole.role.id, name: userRole.role.name }));
  }
  return [];
};

/*
  Permet de retourner la date actuelle à transmettre au champ hireDate afin que ce dernier
  ne puisse pas accepter des valeurs ultérieures à cette dernière
*/
export const getCurrentDate = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();

  // Les mois commencent à 0, d'où le + 1
  let month = currentDate.getMonth() + 1;

  let day = currentDate.getDate();
  month = month < 10 ? `0${month}` : month;
  day = day < 10 ? `0${day}` : day;

  return `${year}-${month}-${day}`;
};

// Convertit la String de date de la bdd en Date pour la valeur par défaut du champ date
export const stringToDate = (date) => {

  // On crée un objet Date avec notre String de date
  const formattedDate = new Date(date);

  // On en déduit l'année
  const year = formattedDate.getFullYear();

  // Les mois commencent à 0, d'où le + 1. On en déduit le mois
  const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0');

  // On en déduit le jour
  const day = formattedDate.getDate().toString().padStart(2, '0');

  // on retourne la date convertit en Date
  return `${year}-${month}-${day}`;
};
  