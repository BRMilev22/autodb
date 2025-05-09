import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/users/${id}`);
      setFormData({
        name: res.data.name,
        email: res.data.email,
        password: '',  // Don't populate password
        role: res.data.role
      });
    } catch (err) {
      setError('Failed to load user details. ' + (err.response?.data?.msg || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const submitData = { ...formData };
      // Only include password if it's provided (for editing users)
      if (!submitData.password && isEditMode) {
        delete submitData.password;
      }
      
      if (isEditMode) {
        await axios.put(`/api/users/${id}`, submitData);
        setSuccess('User updated successfully!');
      } else {
        await axios.post('/api/users', submitData);
        setSuccess('User created successfully!');
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'user'
        });
      }
      
      // Redirect after a short delay to show success message
      setTimeout(() => navigate('/users'), 1500);
      
    } catch (err) {
      setError('Error saving user. ' + (err.response?.data?.msg || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="text-center p-5"><Spinner animation="border" /></div>;
  }

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">{isEditMode ? 'Edit User' : 'Add New User'}</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter user's full name"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email address"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{isEditMode ? 'Password (leave blank to keep current)' : 'Password'}</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!isEditMode}
              placeholder="Enter password"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>
          
          <div className="d-flex justify-content-between">
            <Button variant="secondary" onClick={() => navigate('/users')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" /> : isEditMode ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default UserForm; 