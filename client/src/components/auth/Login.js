import React, { useState, useContext } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Невалиден имейл или парола');
      }
    } catch (err) {
      setError('Грешка при автентикация. Моля, опитайте отново.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={5} lg={4}>
          <Card className="shadow border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
            <div className="text-center p-4 text-white" style={{ 
              background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div className="mb-4">
                <i className="fas fa-car-battery fa-3x mb-3"></i>
                <h4 className="mb-1">АвтоДБ</h4>
                <p className="mb-0 opacity-75">Система за управление на инвентар</p>
              </div>
              <h5>Вход в системата</h5>
            </div>
            
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="mb-4 animate__animated animate__headShake">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </Alert>
              )}
              
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Имейл адрес</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-envelope"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      name="email"
                      value={email}
                      onChange={onChange}
                      placeholder="Въведете имейл"
                      required
                      style={{ borderRadius: '0 5px 5px 0' }}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Парола</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-lock"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={onChange}
                      placeholder="Въведете парола"
                      required
                      style={{ borderRadius: '0' }}
                    />
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ borderRadius: '0 5px 5px 0' }}
                    >
                      <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 mb-3" 
                  disabled={loading}
                  style={{ borderRadius: '5px' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Влизане...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Вход
                    </>
                  )}
                </Button>

                <div className="text-center mt-3">
                  <span>Нямате акаунт? </span>
                  <Link to="/register" className="text-decoration-none">Регистрирайте се</Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 