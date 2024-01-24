import React, { useState } from 'react';

const AdminUserEditModal = ({ user, token, handleClose, handleEditSuccess }) => {
  const [editedUsername, setEditedUsername] = useState(user.username);

  const handleInputChange = (e) => {
    setEditedUsername(e.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Empêcher le comportement par défaut du formulaire

    const updatedUserData = {
      username: editedUsername,
      authRoles: user.authRoles,
    };

    fetch(`http://localhost:8000/api/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/merge-patch+json'
      },
      body: JSON.stringify(updatedUserData)
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Erreur lors de la mise à jour de l\'utilisateur : ' + response.status);
        }
      })
      .then((responseData) => {
        console.log("responseData = ", responseData);
        handleClose();
        handleEditSuccess(responseData.user);
        if (responseData.token) {
          localStorage.setItem('authToken', responseData.token);
        } else {
          console.log('Aucun nouveau token dans la réponse.');
        }
      })
      .catch((error) => console.error('Error updating user:', error));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Modifier l'utilisateur</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input
              type="text"
              value={editedUsername}
              onChange={handleInputChange}
            />
          </label>
          <button type="submit">Valider</button>
        </form>
        <button onClick={handleClose}>Fermer</button>
      </div>
    </div>
  );
};

export default AdminUserEditModal;
