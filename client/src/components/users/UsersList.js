import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Alert, Modal, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, userId: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users');
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load users. ' + (err.response?.data?.msg || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (userId) => {
    setDeleteModal({ show: true, userId });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/users/${deleteModal.userId}`);
      setUsers(users.filter(user => user._id !== deleteModal.userId));
      setDeleteModal({ show: false, userId: null });
    } catch (err) {
      setError('Failed to delete user. ' + (err.response?.data?.msg || err.message));
      console.error(err);
    }
  };

  if (loading && users.length === 0) {
    return <div className="text-center p-5"><Spinner animation="border" /></div>;
  }

  return (
    <div>
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Users Management</h5>
          <Link to="/users/new" className="btn btn-light btn-sm">
            <i className="fas fa-plus"></i> Add User
          </Link>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {users.length === 0 ? (
            <Alert variant="info">No users found.</Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <Link to={`/users/${user._id}/edit`} className="btn btn-sm btn-outline-primary me-2">
                        <i className="fas fa-edit"></i>
                      </Link>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => confirmDelete(user._id)}
                        disabled={user.role === 'admin'}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, userId: null })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this user? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal({ show: false, userId: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsersList; 