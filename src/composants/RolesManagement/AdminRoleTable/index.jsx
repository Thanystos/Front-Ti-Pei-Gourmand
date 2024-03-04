import React, { useState, useEffect } from 'react';
import { Form, Container, Row, Col, Button } from 'react-bootstrap';
import { useApiRequest, useAuth } from '../../../utils/hooks';
import SpinnerWrapper from '../../SpinnerWrapper';

const AdminRolePermissions = () => {

    // State récupérant l'ensemble des rôles enregistrés
    const [roles, setRoles] = useState([]);

    // State récupérant l'ensemble des permissions enregistrés
    const [allPermissions, setAllPermissions] = useState([]);

    // State récupérant le rôle actuellement sélectionné
    const [selectedRole, setSelectedRole] = useState('');

    // State récupérant l'ensemble des permissions accordées au rôle actuellement sélectionné
    const [rolePermissions, setRolePermissions] = useState([]);

    const [changesSaved, setChangedSaved] = useState(true);

    /*
        Contient le token d'authentification et le username de l'utilisateur connecté.
        Partagés par un provider.
    */
    const { authToken } = useAuth();

    /*
        Utilisation du hook useApiRequest
        On indique en paramètre la valeur par défaut du state isLoading
    */
    const {isLoading, error, fetchData, isRedirected } = useApiRequest(true);

    // Informations nécessaires pour les requêtes
    const options = {
        method: 'GET',
        headers : {
        'authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
        }
    };

    useEffect(() => {

        // Méthode permettant l'appel API
        const fetchRoles = async () => {

            // Interroge l'API en demandant la récupération de tous les Rôles
            const response = await fetchData('http://localhost:8000/api/roles', options);

            /* 
                Que la requête ait réussi ou pas, je ne l'affiche pas de suite mais si ça a été le cas,
                elle sera relancée au changement du state isredirected qui cette fois sera false et 
                permettra l'affichage
            */
            if (isRedirected === false) {

                // Je recopie toutes les infos des Rôles dans mon state
                setRoles(response.data['hydra:member'])
            }
        };

        // Méthode permettant l'appel API
        const fetchAllPermissions = async () => {

            // Interroge l'API en demandant la récupération de toutes les Permissions
            const response = await fetchData('http://localhost:8000/api/permissions', options);

            /* 
                Que la requête ait réussi ou pas, je ne l'affiche pas de suite mais si ça a été le cas,
                elle sera relancée au changement du state isredirected qui cette fois sera false et 
                permettra l'affichage
            */
            if (isRedirected === false) {

                // Je recopie toutes les infos des Permissions dans mon state
                setAllPermissions(response.data['hydra:member'].map((permission) => permission.name));
            }
        };

        fetchRoles();
        fetchAllPermissions();

    }, [isRedirected]);

    useEffect(() => {
        
        // Contient les informations du Rôle actuellement sélectionné
        const selectedRoleObject = roles.find((role) => role.name === selectedRole);

        // Si on trouve ce Rôle dans la liste des Rôles récupérée du serveur
        if (selectedRoleObject) {

            // On recopie toutes les permissions de ce Rôle dans le state approprié
            setRolePermissions(selectedRoleObject.rolePermissions.map((rp) => rp.permission.name));
        } else {

            // On vide le tableau des permissions
            setRolePermissions([]);
        }

        setChangedSaved(true);
    }, [selectedRole, roles]);

    // Méthode déclenchée lorsque l'utilisateur choisit un Rôle dans le select
    const handleRoleChange = (event) => {

        // On inscrit dans le state le Rôle qui a été sélectionné
        setSelectedRole(event.target.value);
    };

    // Méthode déclenchée quand les permissions sont modifiées lors d'un clic sur les checkbox
    const handlePermissionChange = (permissionName) => {

        // Met à jour les permissions liées au rôle lorsqu'une case est cochée / décochée
        setRolePermissions((prevRolePermissions) =>
            prevRolePermissions.includes(permissionName)
                ? prevRolePermissions.filter((p) => p !== permissionName)
                : [...prevRolePermissions, permissionName]
        );
        setChangedSaved(false);
    };

    const handleSaveChanges = () => {
        // faire l'appel api des modifs de permissions
        setChangedSaved(true);
    }

    return (
        <>
            <SpinnerWrapper $showSpinner={isLoading} />
            {error ? (
                <p>{error}</p>
            ) : (
                <Container fluid className="pt-4 px-4">
                    <div className="bg-secondary rounded h-100 p-4">
                        <Row className="justify-content-center">
                            <Col sm={12} xl={12}>
                                <Form.Group className="mb-3">
                                <Form.Select
                                    size="sm"
                                    aria-label=".form-select-lg example"
                                    onChange={handleRoleChange}
                                    value={selectedRole}
                                >
                                    <option value="" disabled>
                                    Liste des rôles
                                    </option>
                                    {roles.map((role) => (
                                    <option key={role['@id']} value={role.name}>
                                        {role.name}
                                    </option>
                                    ))}
                                </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="justify-content-center">
                            <Col sm={12} xl={12}>
                                <Form.Group className="mb-3">
                                    {selectedRole && rolePermissions.length > 0 && (
                                        <>
                                            {allPermissions.map((permission) => (
                                                <div key={permission}>
                                                    <Form.Check
                                                        type="checkbox"
                                                        label={permission}
                                                        name={permission}
                                                        id={permission}
                                                        checked={rolePermissions.includes(permission)}
                                                        onChange={() => handlePermissionChange(permission)}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    )}       
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="justify-content-center">
                            <Col sm={12} xl={12}>
                                <p className='text-primary'>{!changesSaved && "Des permissions ont été ajustées pour ce rôle."}</p>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    disabled={changesSaved}
                                    onClick={handleSaveChanges}
                                >
                                    Sauvegarder les changements
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Container>
            )}
        </>
    )   
};

export default AdminRolePermissions;
