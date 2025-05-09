import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="text-center py-5">
      <Alert variant="danger">
        <h1 className="display-4">404</h1>
        <h2>Page Not Found</h2>
        <p className="lead">The page you are looking for does not exist.</p>
        <Button as={Link} to="/dashboard" variant="primary">
          Go to Dashboard
        </Button>
      </Alert>
    </Container>
  );
};

export default NotFound; 