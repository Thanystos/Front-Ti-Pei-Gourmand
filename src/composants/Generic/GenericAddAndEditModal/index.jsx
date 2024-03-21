import React, { useState } from 'react';
import { useApi, useModalManagement } from '../../../utils/hooks';
import IngredientFormPart from '../../FormPart/IngredientFormPart';

const GenericAddAndEditModal = ({ name, handleClose, handleSuccess, selectedEntry }) => {

  // States et méthodes partagés par mes providers
  const { fetchData, authToken } = useApi();

  const { handleSuccessInModal } = useModalManagement();

  const entryColumns = 
    name === 'ingredients' ? {
        title: selectedEntry?.title || '',
        quantity: selectedEntry?.quantity || 0,
        maxQuantity: selectedEntry?.maxQuantity || 0,
        unit: selectedEntry?.unit || '',
        category: selectedEntry?.category || '',
        isAllergen: selectedEntry?.isAllergen || false,
    } : {}

   const [selectedEntryColumns, setSelectedEntryColumns] = useState(entryColumns);

  const [isLoading, setIsLoading] = useState(false);

  // Requête l'API à la soumission du formulaire
  const handleSubmit = async (e) => {

    // Mes requêtes vont s'effectuer, j'affiche mon loading
    setIsLoading(true);

    // On retire le comportement par défaut du formulaire
    e.preventDefault();

    let bodyData = { ...selectedEntryColumns };

    if (name === 'ingredients') {
      const percentQuantity = selectedEntryColumns.quantity !== 0 ? 
        parseFloat((selectedEntryColumns.quantity / selectedEntryColumns.maxQuantity* 100).toFixed(2))
        : 0;
      
      bodyData = { 
        ...bodyData,
        percentQuantity,
      };
    }

    // Informations nécessaires pour la requête
    const entityOptions = {
      method: selectedEntry ? 'PUT' : 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'content-type': 'application/ld+json'
      },
      body: JSON.stringify(bodyData),
    };

    // Méthode requêtant l'API
    const submitEntity = async () => {

      /* ************ TRAITEMENT DU USER ************ */


      // Si un selectedEntry a été spécifié on utilise l'url pour le PUT sinon c'est celle du POST
      const entityUrl = selectedEntry ? `http://localhost:8000/api/${name}/${selectedEntry.id}` : `http://localhost:8000/api/${name}`;
      
      // On requête l'API pour traiter l'inscription ou la modification d'un User
      const { data: entityData, response } = await fetchData(entityUrl, entityOptions);

      if (!entityData) {
        setIsLoading(false);
        return;
      }

      handleSuccessInModal(response, handleClose, handleSuccess, setIsLoading);
    };
    
    submitEntity();
  };
  
    return (
        <>
        {name === 'ingredients' && 
            <IngredientFormPart selectedEntryColumns={selectedEntryColumns} setSelectedEntryColumns={setSelectedEntryColumns} handleSubmit={handleSubmit} handleClose={handleClose} isLoading={isLoading} />
        }
    </> 
  );
};

export default GenericAddAndEditModal;