import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar 
      expand="lg" 
      className="shadow-sm"
      style={{ 
        background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
        padding: '12px 0'
      }}
      variant="dark"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <i className="fas fa-car-battery me-2 fs-3"></i>
          <div>
            <span className="fw-bold">АвтоДБ</span>
            <small className="d-block" style={{ fontSize: '0.7rem', opacity: 0.8 }}>Система за инвентаризация</small>
          </div>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-nav" />
        
        <Navbar.Collapse id="navbar-nav">
          {user ? (
            <>
              <Nav className="me-auto">
                <Nav.Link 
                  as={Link} 
                  to="/dashboard" 
                  className="mx-1 px-2 rounded-pill"
                  activeClassName="active"
                >
                  <i className="fas fa-tachometer-alt me-1"></i> Табло
                </Nav.Link>
                
                <Nav.Link 
                  as={Link} 
                  to="/parts" 
                  className="mx-1 px-2 rounded-pill"
                  activeClassName="active"
                >
                  <i className="fas fa-cogs me-1"></i> Части
                </Nav.Link>
                
                <Nav.Link 
                  as={Link} 
                  to="/low-stock" 
                  className="mx-1 px-2 rounded-pill"
                  activeClassName="active"
                >
                  <i className="fas fa-exclamation-triangle me-1"></i> Ниска наличност
                </Nav.Link>
                
                <Nav.Link 
                  as={Link} 
                  to="/import-export" 
                  className="mx-1 px-2 rounded-pill"
                  activeClassName="active"
                >
                  <i className="fas fa-exchange-alt me-1"></i> Импорт/Експорт
                </Nav.Link>
                
                {user && user.role === 'admin' && (
                  <Nav.Link 
                    as={Link} 
                    to="/users" 
                    className="mx-1 px-2 rounded-pill"
                    activeClassName="active"
                  >
                    <i className="fas fa-users me-1"></i> Потребители
                  </Nav.Link>
                )}
              </Nav>
              
              <Nav>
                <NavDropdown 
                  title={
                    <span>
                      <i className="fas fa-user-circle me-1"></i> {user.name || 'Потребител'}
                    </span>
                  } 
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item disabled>
                    <small className="text-muted">{user.email}</small>
                  </NavDropdown.Item>
                  <NavDropdown.Item disabled>
                    <small className="text-muted">
                      Роля: {user.role === 'admin' ? 'Администратор' : 'Потребител'}
                    </small>
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>Изход
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/login" className="me-2">
                <Button size="sm" variant="outline-light" className="rounded-pill px-3">
                  <i className="fas fa-sign-in-alt me-1"></i> Вход
                </Button>
              </Nav.Link>
              <Nav.Link as={Link} to="/register">
                <Button size="sm" variant="light" className="rounded-pill px-3 text-primary">
                  <i className="fas fa-user-plus me-1"></i> Регистрация
                </Button>
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 