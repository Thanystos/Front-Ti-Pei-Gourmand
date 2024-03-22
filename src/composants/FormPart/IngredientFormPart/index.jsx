import React from 'react';
import { propTypes } from 'prop-types';
import { Button, Form, Modal } from 'react-bootstrap';
import { useApi } from '../../../utils/hooks';
import SpinnerWrapper from '../../SpinnerWrapper';

function IngredientFormPart({
  selectedEntryColumns, setSelectedEntryColumns, handleSubmit, handleClose, isLoading,
}) {
  const { errors } = useApi();

  const unitChoice = {
    Volume: ['l', 'dl', 'cl', 'ml'],
    Poids: ['kg', 'g'],
  };

  const categoryChoice = [
    'Boissons',
    'Céréales',
    'Fruits',
    'Légumineuses',
    'Légumes',
    'Noix et graines',
    'Œufs',
    'Plats préparés',
    'Poissons et fruits de mer',
    'Produits de boulangerie',
    'Produits laitiers',
    'Sauces et condiments',
    'Snacks et confiseries',
    'Sucre et édulcorants',
    'Viandes',
    'Autres',
  ];

  const handleInputChange = (e) => {
    const {
      name, value, type, checked,
    } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    console.log(checked);
    if (name === 'quantity' || name === 'maxQuantity') {
      const quantity = parseFloat(newValue);
      setSelectedEntryColumns((prevEntryColumns) => ({
        ...prevEntryColumns,
        [name]: Number.isNaN(quantity) ? prevEntryColumns[name] : quantity,
      }));
    } else {
      setSelectedEntryColumns((prevEntryColumns) => ({
        ...prevEntryColumns,
        [name]: newValue,
      }));
    }
  };
  return (
    <>
      <SpinnerWrapper $showSpinner={isLoading} />
      <Modal show onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="modal-title">
            {selectedEntryColumns ? 'Édition ' : 'Ajout '}
            d&apos;ingrédients
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit}>

            <Form.Group className="mb-3" controlId="title">
              <Form.Label>
                Nom
                <span className="text-primary ml-2">*</span>
              </Form.Label>
              <Form.Control type="text" name="title" onChange={handleInputChange} value={selectedEntryColumns.title} required />
              {errors.includes('duplicateTitle') && <p className="text-primary">Cet ingrédient est déjà répertorié.</p>}
              {errors.includes('emptyTitle') && <p className="text-primary">Le nom doit être spécifié.</p>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="quantity">
              <Form.Label>
                Quantité
                <span className="text-primary ml-2">*</span>
              </Form.Label>
              <Form.Control type="number" min="0" max={selectedEntryColumns.maxQuantity} name="quantity" onChange={handleInputChange} value={selectedEntryColumns.quantity} required />
              {errors.includes('emptyQuantity') && <p className="text-primary">La quantité doit être spécifiée</p>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="maxQuantity">
              <Form.Label>
                Quantité max
                <span className="text-primary ml-2">*</span>
              </Form.Label>
              <Form.Control type="number" min="0" name="maxQuantity" onChange={handleInputChange} value={selectedEntryColumns.maxQuantity} required />
              {errors.includes('emptyMaxQuantity') && <p className="text-primary">La quantité maximale doit être spécifiée</p>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="unit">
              <Form.Label>
                Unité
                <span className="text-primary ml-2">*</span>
              </Form.Label>
              <Form.Select name="unit" onChange={handleInputChange} value={selectedEntryColumns.unit} required>
                <option value="" disabled>Sélectionner une unité de mesure</option>
                {Object.entries(unitChoice).map(([group, units]) => (
                  <optgroup label={group} key={group}>
                    {units.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </optgroup>
                ))}
              </Form.Select>
              {errors.includes('emptyUnit') && <p className="text-primary">L&apos;unité de mesure doit être spécifiée</p>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="unit">
              <Form.Label>
                Catégorie
                <span className="text-primary ml-2">
                  *
                </span>
              </Form.Label>
              <Form.Select name="category" onChange={handleInputChange} value={selectedEntryColumns.category} required>
                <option value="" disabled>Sélectionner une catégorie</option>
                {categoryChoice.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
              {errors.includes('emptyCategory') && <p className="text-primary">La catégorie doit être spécifiée</p>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="isAllergen">
              <Form.Label>
                Allergène ?
                <span className="text-primary ml-2">
                  *
                </span>
              </Form.Label>
              <Form.Check type="checkbox" name="isAllergen" onChange={handleInputChange} checked={selectedEntryColumns.isAllergen} />
            </Form.Group>

            <div className="d-flex justify-content-center w-100">
              <Button variant="success" size="sm" className="me-4" type="submit">
                Valider
              </Button>

              <Button variant="primary" size="sm" onClick={handleClose}>
                Annuler
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

IngredientFormPart.propTypes = {
  selectedEntryColumns: propTypes.shape({
    title: propTypes.string.isRequired,
    quantity: propTypes.number.isRequired,
    maxQuantity: propTypes.number.isRequired,
    unit: propTypes.number.isRequired,
    category: propTypes.string.isRequired,
    isAllergen: propTypes.bool.isRequired,
  }).isRequired,
  setSelectedEntryColumns: propTypes.func.isRequired,
  handleSubmit: propTypes.func.isRequired,
  handleClose: propTypes.func.isRequired,
  isLoading: propTypes.bool.isRequired,
};

export default IngredientFormPart;
