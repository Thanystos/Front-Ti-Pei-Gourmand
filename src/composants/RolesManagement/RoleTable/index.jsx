import React, { useState, useEffect } from 'react';
import { Form, Container, Row, Col, Button } from 'react-bootstrap';
import { useApi } from '../../../utils/hooks';
import SpinnerWrapper from '../../SpinnerWrapper';

const RoleTable = () => {

    /*
        Contient le token d'authentification et le username de l'utilisateur connecté.
        Partagés par un provider.
    */
    const { error, fetchData, authToken, isArraySuperset, updateAssociativeEntity } = useApi();

    // State récupérant l'ensemble des rôles enregistrés
    const [roles, setRoles] = useState([]);

    // State récupérant l'ensemble des permissions enregistrés
    const [allPermissions, setAllPermissions] = useState([]);

    // State récupérant le rôle actuellement sélectionné
    const [selectedRole, setSelectedRole] = useState('Administrateur');

    const [selectedRoleId, setselectedRoleId] = useState(0);

    // State contenant les informations des permissions qu'on souhaite attribuer à un rôle
    const [rolePermissions, setRolePermissions] = useState([]);

    // State contenant l'id des permissions réellement et actuellement accordées à un rôle
    const [initialRolePermissionsId, setInitialRolePermissionsId] = useState([]);

    const [changesSaved, setChangesSaved] = useState(true);

    const [reload, setReload] = useState(true);

    // State permettant de gérer le spinner de chargement
    const [isLoading, setIsLoading] = useState(true);

    const displayedGroups = new Set();

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
        const fetchRolesAndPermissions = async () => {

            // Interroge l'API en demandant la récupération de tous les Rôles
            const { data: roleData } = await fetchData('http://localhost:8000/api/roles', options);

            if (!roleData) {
                setIsLoading(false);
                return;
            }

            // Je recopie toutes les infos des Rôles dans mon state
            setRoles(roleData['hydra:member']);
            
            // Interroge l'API en demandant la récupération de toutes les Permissions
            const { data: permissionData } = await fetchData('http://localhost:8000/api/permissions', options);

            // Je recopie toutes les infos des Permissions dans mon state
            setAllPermissions(permissionData['hydra:member'].map((permission) => ({
                id: permission.id,
                name: permission.name,
                scope: permission.scope,
            })));

            setIsLoading(false);
        };

        if (reload) {
            setIsLoading(true);
            fetchRolesAndPermissions();
            setReload(false);
        }
        

    }, [reload]);

    useEffect(() => {
       
        // Contient les informations du Rôle actuellement sélectionné
        const selectedRoleObject = roles.find((role) => role.name === selectedRole);

        // Si on trouve ce Rôle dans la liste des Rôles récupérée du serveur
        if (selectedRoleObject) {

            setselectedRoleId(selectedRoleObject.id);

            // On récupère les permissions actuellement réellement attribuées au rôle sélectionné
            setInitialRolePermissionsId(selectedRoleObject.rolePermissions.map((rolePermission) => rolePermission.permission.id));

            // On recopie toutes les permissions de ce Rôle dans le state approprié
            setRolePermissions(selectedRoleObject.rolePermissions.map((rolePermission) => ({
                id: rolePermission.permission.id,
                name: rolePermission.permission.name,
            })));

        } else {

            // On vide le tableau des permissions
            setRolePermissions([]);
        }

    }, [selectedRole, roles]);

    useEffect(() => {

        const arePermissionsChanged = (isArraySuperset(initialRolePermissionsId, rolePermissions.map((rolePermission) => rolePermission.id)) && isArraySuperset(rolePermissions.map((rolePermission) => rolePermission.id), initialRolePermissionsId));
        setChangesSaved(arePermissionsChanged);

    }, [initialRolePermissionsId, rolePermissions]);

    // Méthode déclenchée lorsque l'utilisateur choisit un Rôle dans le select
    const handleRoleChange = (roleName) => {

        // On inscrit dans le state le Rôle qui a été sélectionné
        setSelectedRole(roleName);
    };

    // Méthode déclenchée quand les permissions sont modifiées lors d'un clic sur les checkbox
    const handlePermissionChange = (permissionId, permissionName) => {

        // Met à jour les permissions liées au rôle lorsqu'une case est cochée / décochée
        setRolePermissions((prevRolePermissions) => {
            const permissionExists = prevRolePermissions.some((permission) => permission.name === permissionName);

            if (permissionExists) {
                return prevRolePermissions.filter((permission) => permission.name !== permissionName);
            } else {
                return [...prevRolePermissions, { id: permissionId, name: permissionName }];
            }
        });
    };

    const handleSubmit = async () => {
        const rolePermissionsId = rolePermissions.map((rolePermission) => rolePermission.id);

        setIsLoading(true);
        await updateAssociativeEntity('role_permissions', selectedRoleId, rolePermissionsId, initialRolePermissionsId);

        setInitialRolePermissionsId(rolePermissionsId);
        setReload(true);
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
                                    onChange={(e) => handleRoleChange(e.target.value)}
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
                                    {selectedRole && (
                                        <>
                                            {allPermissions.map((permission) => {

                                                // Contiendra le div du scope de permission
                                                let groupDiv = null;

                                                if (permission.scope && !displayedGroups.has(permission.scope)) {
                                                    
                                                    // Si le scope apparaît une fois en l'ajoute à notre ensemble de scope
                                                    displayedGroups.add(permission.scope);

                                                    // On peut construire notre div qu'on ajoutera à l'affichage
                                                    groupDiv = <h6 className=' mt-3 mb-3' key={permission.scope}>{permission.scope}</h6>  
                                                }

                                                // Ce div contenant les checkbox sera toujours affiché
                                                const checkboxDiv = (
                                                    <div key={permission.name}>
                                                        <Form.Check
                                                            type="checkbox"
                                                            label={permission.name}
                                                            name={permission.name}
                                                            id={permission.name}
                                                            checked={rolePermissions.some(rolePermission => rolePermission.name === permission.name)}
                                                            onChange={() => handlePermissionChange(permission.id, permission.name)}
                                                        />
                                                    </div>
                                                );

                                                // Permet l'affichage des 2 blocs
                                                return [groupDiv, checkboxDiv];
                                            })}
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
                                    onClick={handleSubmit}
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

export default RoleTable;
