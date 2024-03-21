import React, { useState } from 'react';
import GenericTable from '../../Generic/GenericTable';

const RoleTable = () => {

  // State permettant de définir les informations des Users à afficher
  const [displayedColumns, setDisplayedColumns] = useState({
    quantity: true,
    percentQuantity: true,
    unit: true,
    category: true,
    isAllergen: false,
  });

  return (
    <GenericTable name={'ingredients'} displayedColumns={displayedColumns} setDisplayedColumns={setDisplayedColumns}/>
  );
};

export default RoleTable;