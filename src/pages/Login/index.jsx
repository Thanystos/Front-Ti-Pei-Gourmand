/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from 'react';
import {
  Button, Col, Container, Form, Row,
} from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserEdit } from '@fortawesome/free-solid-svg-icons';
import { useApi } from '../../utils/hooks';
import SpinnerWrapper from '../../composants/SpinnerWrapper';

function Login() {
  // States et méthodes partagés par mon provider
  const {
    setIsLoading, errors, fetchData, updateUserAuth,
  } = useApi();

  // States récupérant le contenu des champs du même nom du formulaire
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // State permettant de gérer le spinner de chargement
  const [isLoadingLogin, setIsLoadingLogin] = useState(true);

  // Permet la redirection
  const navigate = useNavigate();

  // Permet de récupérer le message d'erreur lié à l'invalidité du token d'id
  const location = useLocation();
  const errorMessage = location.state?.errorMessage;

  // Détermine, si l'erreur est liée à l'invalidité du token d'id ou autre
  const messageToshow = errors.length === 0 ? errorMessage : errors;

  // Requête l'API à la soumission du formulaire
  const handleSubmit = async (e) => {
    // On retire le comportement par défaut du formulaire
    e.preventDefault();

    // Mes requêtes vont s'effectuer, j'affiche mon loading
    setIsLoading(true);

    // Informations nécessaires pour la requête
    const loginOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    };

    // Interroge l'API lui demandant de fournir le token d'id lié au User identifié
    const { data } = await fetchData('http://localhost:8000/api/login', loginOptions, true);

    // Si le User est trouvé son token d'id sera disponible
    if (data.token) {
      console.log('1');

      // Permet d'obtenir toutes les informations d'identification du user
      updateUserAuth(data.token);

      // Redirection vers la page d'administration
      navigate('/admin');
    } else {
      // Si ce n'est pas le cas on retire le loading
      setIsLoading(false);
    }
  };

  // Affiche le spinner pendant 1s au montage initial (purement esthétique)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setIsLoadingLogin(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  });

  console.log('Montage du composant Login (2 fois initialement)');
  return (
    <Container fluid className="position-relative d-flex p-0">
      <SpinnerWrapper $showSpinner={isLoadingLogin} />
      <Container fluid>
        <Row className="h-100 align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
          <Col xs={12} sm={8} md={6} lg={5} xl={4}>
            <div className="bg-secondary rounded p-4 p-sm-5 my-4 mx-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="text-primary">
                  <FontAwesomeIcon icon={faUserEdit} className="me-2" />
                  TP Gourmand
                </h3>
              </div>
              <Form onSubmit={handleSubmit}>
                <Form.Floating className="mb-3">
                  <Form.Control type="text" id="floatingInput" value={username} onInput={(e) => setUsername(e.target.value)} required />
                  <label htmlFor="floatingInput">Pseudonyme</label>
                </Form.Floating>
                <Form.Floating className="mb-4">
                  <Form.Control type="password" id="floatingPassword" value={password} onInput={(e) => setPassword(e.target.value)} required />
                  <label htmlFor="floatingPassword">Mot de passe</label>
                </Form.Floating>
                <Button type="submit" className="btn btn-primary py-3 w-100">Connexion</Button>
                {messageToshow && (
                  <p className="text-primary text-center mt-4 mb-0">{messageToshow}</p>
                )}
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default Login;
