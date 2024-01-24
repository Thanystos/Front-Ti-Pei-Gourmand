import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserEdit } from '@fortawesome/free-solid-svg-icons';
import useApiRequest from '../../utils/hooks';
import { errorMessages } from '../../utils/errors';
import { useAuth } from '../../utils/hooks';
import { jwtDecode } from 'jwt-decode';
import SpinnerWrapper from '../../composants/SpinnerWrapper';

const Login = () => {

  // Méthode de maj des informations d'authentification. Partagée par un provider.
  const { updateUserAuth } = useAuth();

  // States récupérant le contenu des champs du même nom du formulaire
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // State affichant ou non le spinner par dessus la page pendant 1s
  const [showSpinner, setShowSpinner] = useState(true);

  // Permet la redirection
  const navigate = useNavigate();

  /* 
    Utilisation d'un hook pour la requête API
    Récupération des states du hook et de la méthode de requête
  */
  const { isLoading, error, fetchData } = useApiRequest();

  // Permet de récupérer le message lié à la redirection vers le Login
  const location = useLocation();
  const errorMessage = location.state?.errorMessage;

  // Requête l'API à la soumission du formulaire
  const handleSubmit = async (e) => {

    // On retire le comportement par défaut du formulaire
    e.preventDefault();
  
    // Informations nécessaires pour la requête
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    };
  
    // Interroge l'API en matchant les ids du formulaire et les utilisateurs enregistrés
    const { data } = await fetchData('http://localhost:8000/api/login', options, errorMessages.invalidCredentials);

    // En cas d'identifiants reconnus
    if (data.token) {
      // Stockage du token d'authentification dans le LS
      localStorage.setItem('authToken', data.token);

      // Récupération des rôles associés au token
      const decodedToken = jwtDecode(data.token);
      const authRoles = decodedToken.roles || '';
      const authUser = decodedToken.username;

      // Maj des valeurs partagées par le context AuthContext
      updateUserAuth(data.token, authRoles, authUser);

      // Redirection vers la page d'administration
      navigate('/admin');
    }
  };

  // Affiche le spinner pendant 1s quand le composant est monté afin de simuler un chargement de la page
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(false);
    }, 1000);

     // Nettoyage du timer pour éviter les fuites mémoire
    return () => clearTimeout(timer);
  }, []);

  return (
    <Container fluid className="position-relative d-flex p-0">
      <SpinnerWrapper $showSpinner={showSpinner || isLoading} />
      <Container fluid>
        <Row className="h-100 align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
          <Col xs={12} sm={8} md={6} lg={5} xl={4}>
            <div className="bg-secondary rounded p-4 p-sm-5 my-4 mx-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                  <h3 className="text-primary"><FontAwesomeIcon icon={faUserEdit} className='me-2' />TP Gourmand</h3>
              </div>
              <Form onSubmit={handleSubmit}>
                <Form.Floating className="mb-3">
                  <Form.Control type="text" id="floatingInput"  value={username} onChange={(e) => setUsername(e.target.value)} required />
                  <label htmlFor="floatingInput">Pseudonyme</label>
                </Form.Floating>
                <Form.Floating className="mb-4">
                  <Form.Control type="password" id="floatingPassword" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <label htmlFor="floatingPassword">Mot de passe</label>
                </Form.Floating>
                <Button type="submit" className="btn btn-primary py-3 w-100">Connexion</Button>
                {(error || errorMessage) && (
                  <p className="text-primary text-center mt-4 mb-0">{error || errorMessage}</p>
                )}
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default Login;