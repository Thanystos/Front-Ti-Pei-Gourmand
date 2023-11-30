import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const LoginForm = styled.form`
  /* Styles pour le formulaire */
`;

const ErrorMessage = styled.p`
  color: red;
`;

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Utilisation de useNavigate à la place de useHistory

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      username,
      password,
    };

    try {
      // La validation du formulaire entraîne l'envoie des information spécifiées
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      // Si tout c'est bien passé on récupère la réponse qui est le token d'auth
      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('authToken', token);
        onLoginSuccess(token); // Appel de la fonction de succès pour stocker le token dans le state
        navigate('/admin'); // Redirection vers la page d'administration après la connexion réussie
      } else {
        setError('Identifiant ou mot de passe incorrect');
      }
    } catch (error) {
      console.error('Erreur lors de l\'authentification :', error);
      setError('Erreur lors de la connexion');
    }
  };

  return (
    <>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <LoginForm onSubmit={handleSubmit}>
        <label htmlFor="username">Identifiant:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password">Mot de passe:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input type="submit" value="Se connecter" />
      </LoginForm>
    </>
  );
};

export default Login;
