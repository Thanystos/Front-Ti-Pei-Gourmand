// Méthodes des ressources autorisées à modifier le cache
const allowedMethodsByURLForResource = {
  'http://localhost:8000/api/users': ['POST', 'PUT', 'PATCH', 'DELETE'],
  'http://localhost:8000/api/ingredients': ['POST', 'PUT', 'PATCH', 'DELETE'],
};

// Méthodes des ressources de composition autorisées à modifier le cache des ressources associées
const allowedMethodsByURLForComposition = {
  'http://localhost:8000/api/user_roles': ['POST', 'DELETE'],
  'http://localhost:8000/api/role_permissions': ['POST', 'DELETE'],
}

export function methodSelection(url, data, response, cache, updateCache, options) {

  // Si on a une requête GET qui n'a pas encore sa réponse en cache
  if (options.method === 'GET') {

    return handleGetRequest(url, data, response, updateCache);
  
  // Si on est dans le cas d'une modification
  } else if (['PUT', 'PATCH'].includes(options.method)) {
      
      return handlePutOrPatchRequest(url, data, response, cache, updateCache, options);

  // Si on est dans le cas d'un ajout
  } else if(options.method === 'POST') {
    
    console.log('Mon cache dans le POST : ', cache);

    return handlePostRequest(url, data, response, cache, updateCache, options);

  // Si on est dans le cas d'une suppression
  } else if(options.method === 'DELETE') {

    return handleDeleteRequest(url, data, response, cache, updateCache, options);

  // Dans tous les autres cas on ne fait rien et on se contente d'envoyer les données et la réponse
  } else {

    return { data, response };          
  }
}

function handleGetRequest(url, data, response, updateCache) {

  console.log('GET pour entité classique');

  // Je mets le cache à jour
  updateCache(url, data);
    
  // Je renvoie la réponse
  return {data, response};;
}

function handlePutOrPatchRequest(url, data, response, cache, updateCache, options) {

  console.log('PUT PATCH pour entité classique');

  // Je récupère l'url de la ressource sans l'id
  const resourceUrl = url.substring(0, url.lastIndexOf("/"));
  console.log('resourceUrl : ' + resourceUrl);

  // Je récupère l'id de la ressource
  const resourceId = getResourceIdFromUrl(url);
  console.log('resourceId : ' + resourceId);

  console.log('options.method : ' + options.method);

  // Si la modification de la resource par la méthode options.methods est autorisée
  if (allowedMethodsByURLForResource[resourceUrl]?.includes(options.method)) {

    // J'effectue la modification du cache
    handlePutOrPatchRequestLogic(data, resourceUrl, resourceId, cache, updateCache);
  }

  // Je renvoie la réponse
  return {data, response};
}

function handlePostRequest(url, data, response, cache, updateCache, options) {

  // Si la modification de la resource par la méthode options.methods est autorisée
  if(allowedMethodsByURLForResource[url]?.includes(options.method)) {

    console.log('POST pour entité classique');

    // J'effectue la modification du cache
    handleClassicPostRequestLogic(url, data, cache, updateCache);
    console.log('Mon cache qui devrait être complet : ', cache);
  } else if (allowedMethodsByURLForComposition[url]?.includes(options.method)) {

    console.log('POST pour entité de composition');

    // J'effectue la modification du cache
    handleCompositionPostRequestLogic(url, data, cache, updateCache);
  }

  return { data, response };
}

function handleDeleteRequest(url, data, response, cache, updateCache, options) {

  if(allowedMethodsByURLForResource[url]?.includes(options.method)) {

    console.log('DELETE pour entité classique');

    // J'effectue la modification du cache
    handleClassicDeleteRequestLogic(url, data, cache, updateCache);

  } else if (allowedMethodsByURLForComposition[url]?.includes(options.method)) {

    console.log('DELETE pour entité de composition');

    // J'effectue la modification du cache
    handleCompositionDeleteRequestLogic(url, data, cache, updateCache)
  }

  return { data, response };
}


/* ************ MÉTHODES DE CONSTRUCTION DU CACHE ************ */


// Méthode permettant d'ajouter ou de remplacer des informations au cache
const updateCacheForResource = (resourceUrl, updatedMembers, resourceDataInCache, updateCache) => {

  console.log('resourceDataInCache : ', resourceDataInCache);

  // Je recrée mon cache en recopiant son contenu et en ajoutant le hydra:member modifié
  const updatedCache = {
    ...resourceDataInCache,
    'hydra:member': updatedMembers,
  };

  console.log('updatedCache : ', updatedCache);

  updateCache(resourceUrl, updatedCache);
};

// Méthode spécifique aux opérations PUT et PATCH et visant à construire les informations à ajouter au cache
const handlePutOrPatchRequestLogic = (data, resourceUrl, resourceId, cache, updateCache) => {

  console.log('resourceUrl :' + resourceUrl);
  console.log('resourceId : ' + resourceId);

  // Je récupère le nom de la ressource en cours de modification
  const resourceName = getResourceName(resourceUrl);
  console.log('resourceName : ' + resourceName);

  // Je récupère les informations concernant la modification de la ressource
  const resourceDataFromPut = data[resourceName];
  console.log('resourceDataFromPut : ', resourceDataFromPut);

  // Je récupère les informations actuellement en cache pour ma ressource
  const resourceDataInCache = cache[resourceUrl];
  console.log('resourceDataInCache : ', resourceDataInCache);

  // Je recupère plus précisément les informations hydra:member actuellement en cache pour ma ressource
  const updatedMembers = resourceDataInCache['hydra:member'].map(resource => {

    // Puis quand je trouve la ressource modifiée repérable par l'id
    if (resource.id === resourceId) {

      console.log('resource.id : ' + resource.id);
      
      // Je remplace le contenu du hydra member de ce membre par ce que j'ai reçu de mon serveur
      return dataFromServerProcessor(resourceDataFromPut);
    } 
    else {
      return resource;
    }
  });

  console.log('updatedMembers : ', updatedMembers);
  updateCacheForResource(resourceUrl, updatedMembers, resourceDataInCache, updateCache);
};

// Méthode spécifique aux opérations POST sur les entités et visant à construire les informations à ajouter au cache
const handleClassicPostRequestLogic = (url, data, cache, updateCache) => {

  const resourceName = getResourceName(url);

  // Je récupère les informations concernant l'ajout de la ressource
  const resourceDataFromPost = data[resourceName];         
  console.log('datafrompost : ', resourceDataFromPost);

  // Je récupère les informations actuellement en cache pour ma ressource
  const resourceDataInCache = cache[url];
  console.log('resourceDataInCache : ', resourceDataInCache);

  // Je recupère plus précisément les informations hydra:member actuellement en cache pour ma ressource
  const resourceDataInCacheMembers = resourceDataInCache['hydra:member'];

  // Je recopie toutes les infos qu'il y a dans hydra:member en ajoutant celles provenant du serveur
  const updatedMembers = [
    ...resourceDataInCacheMembers,
    dataFromServerProcessor(resourceDataFromPost),
  ];

  console.log('updatedMembers : ', updatedMembers);
  updateCacheForResource(url, updatedMembers, resourceDataInCache, updateCache);
}

// Méthode spécifique aux opérations POST sur les compositions et visant à construire les informations à ajouter au cache
const handleCompositionPostRequestLogic = (url, data, cache, updateCache) => {

  // Je récupère le nom de la ressource de composition en cours d'ajout
  const resourceCompoName = getResourceName(url);
  console.log('resourceCompoName : ', resourceCompoName);

  // Je déduis l'url de la ressource affectée par la composition
  url = transformUrlFromComposition(url);
  console.log('url : ', url);

  // Je récupère le nom de la ressource affectée par l'ajout de composition
  const resourceName = getResourceName(url);

  // Je récupère l'id de la ressource affectée par l'ajout de composition
  const resourceIdFromPost = data[resourceName];
  console.log('resourceIdFromPost : ', resourceIdFromPost);

  // Je récupère les informations concernant l'ajout de composition
  const compoAddedFromPost = data.compositionsAdded;
  console.log('compoAddedFromPost : ', compoAddedFromPost);

  // Je récupère les informations actuellement en cache pour ma ressource
  const resourceDataInCache = cache[url];
  console.log('resourceDataInCache : ', resourceDataInCache);

  // Je recupère plus précisément les informations hydra:member actuellement en cache pour ma ressource
  const updatedMembers = resourceDataInCache['hydra:member'].map(resource => {

    // Puis quand je trouve la ressource modifiée repérable par l'id
    if (resource.id === resourceIdFromPost) {

      console.log('resource.id : ' + resource.id );
      
      // J'ajoute les informations de composition au cache
      resource[resourceCompoName].push(...compoAddedFromPost);

    }
    return resource;
  });

  console.log('updatedMembers : ', updatedMembers);
  updateCacheForResource(url, updatedMembers, resourceDataInCache, updateCache);
}

const handleClassicDeleteRequestLogic = (url, data, cache, updateCache) => {

  const resourceName = getResourceName(url);

  // Je récupère les informations actuellement en cache pour ma ressource
  const resourceDataInCache = cache[url];
  console.log('resourceDataInCache : ', resourceDataInCache);

  // Je récupère l'id de la ou les ressources affectées par la suppression
  const resourceIdFromDelete = data[resourceName];

  // Je ne garde que les membres de hydra:member dont l'id ne se trouve pas dans le tableau d'id supprimés
  const updatedMembers = resourceDataInCache['hydra:member'].filter(member => !resourceIdFromDelete.includes(member.id));

  console.log('updatedMembers : ', updatedMembers);
  updateCacheForResource(url, updatedMembers, resourceDataInCache, updateCache);
}

// Méthode spécifique aux opérations DELETE sur les compositions et visant à supprimer des informations du cache
const handleCompositionDeleteRequestLogic = (url, data, cache, updateCache) => {

  // Je récupère le nom de la ressource de composition en cours de suppression
  const resourceCompoName = getResourceName(url);
  console.log(resourceCompoName);

  // Je déduis l'url de la ressource affectée par la composition
  url = transformUrlFromComposition(url);
  console.log('url : ', url);

  // Je récupère le nom de la ressource affectée par la suppression de composition
  const resourceName = getResourceName(url);
  console.log('resourceName : ', resourceName);

  // Je récupère l'id de la ressource affectée par la suppression de composition
  const resourceIdFromDelete = data[resourceName];
  console.log('resourceIdFromDelete : ', resourceIdFromDelete);

  // Je récupère les ids des compositions à supprimer
  const compoRemovedFromDelete = data.compositionsRemoved;
  console.log('compoRemovedFromDelete : ', compoRemovedFromDelete);

  // Je récupère les informations actuellement en cache pour ma ressource
  const resourceDataInCache = cache[url];
  console.log('resource en cache avant modif : ', resourceDataInCache)

  // Je recupère plus précisément les informations hydra:member actuellement en cache pour ma ressource
  const updatedMembers = resourceDataInCache['hydra:member'].map(resource => {

    // Puis quand je trouve la ressource affectée (repérable par son id) par la suppression de sa composition
    if (resource.id === resourceIdFromDelete) {
        
      console.log('resource.id : ' + resource.id );

      // Je retire les informations de composition (repérables grâce à leur id) au cache
      resource[resourceCompoName] = resource[resourceCompoName].filter(resourceCompo => !compoRemovedFromDelete.includes(resourceCompo.id));
    }
    return resource;
  });

  console.log('updatedMembers : ', updatedMembers);
  updateCacheForResource(url, updatedMembers, resourceDataInCache, updateCache);
}


/* ************ FIN MÉTHODES DE CONSTRUCTION DU CACHE ************ */


// Modifie les data reçues du serveur
function dataFromServerProcessor(resourceDataFromServer) {

  let updatedHireDateFromServer = resourceDataFromServer.hireDate ? resourceDataFromServer.hireDate : "";
  let updatedEndDateFromServer = resourceDataFromServer.endDate ? resourceDataFromServer.endDate : "";

  // Si la propriété 'hireDate' existe, utilisez la valeur, sinon, mettez la chaîne vide
  if (resourceDataFromServer.hireDate && resourceDataFromServer.hireDate.date) {
    updatedHireDateFromServer = resourceDataFromServer.hireDate.date; 
  }

  // Si la propriété 'endDate' existe, utilisez la valeur, sinon, mettez la chaîne vide
  if (resourceDataFromServer.endDate && resourceDataFromServer.endDate.date) {
    updatedEndDateFromServer = resourceDataFromServer.endDate.date; 
  }

  return {  
    ...resourceDataFromServer, 
    hireDate: updatedHireDateFromServer,
    endDate: updatedEndDateFromServer,
  };
}



// Permet, dans le cas d'un PUT ou d'un PATCH, d'extraire l'id de le ressource modifié via l'URL
const getResourceIdFromUrl = (url) => {
  const parts = url.split('/');

  // L'ID de l'utilisateur est le dernier segment de l'URL
  return parseInt(parts[parts.length - 1]);
};


// Permet de match une composition avec une des ressources associée
export function transformUrlFromComposition(url) {
  switch (url) {
      case 'http://localhost:8000/api/user_roles':
        return 'http://localhost:8000/api/users';
      case 'http://localhost:8000/api/role_permissions':
        return 'http://localhost:8000/api/roles';
      default:
          return url;
  }
}

// Permet de récupérer le nom de la ressource visée par la requête
function getResourceName(url) {
  switch (url) {
      case 'http://localhost:8000/api/users':
        return 'user';
      case 'http://localhost:8000/api/roles':
        return 'role';
      case 'http://localhost:8000/api/permissions':
        return 'permission';
      case 'http://localhost:8000/api/ingredients':
        return 'ingredient'
      case 'http://localhost:8000/api/user_roles':
        return 'userRoles';
      case 'http://localhost:8000/api/role_permissions':
        return 'rolePermissions';
      default:
          return url;
  }
}
