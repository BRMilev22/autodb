import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalParts: 0,
    lowStockParts: 0,
    outOfStockParts: 0,
    categories: 0,
    latestParts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/dashboard');
        setStats(res.data);
        setError(null);
      } catch (err) {
        setError('Грешка при зареждане на данните за таблото');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mock data if the API is not implemented yet
  useEffect(() => {
    // Only use mock data if we're still loading and don't have an error
    if (loading && !error) {
      // Simulate API response delay
      const timer = setTimeout(() => {
        setStats({
          totalParts: 145,
          lowStockParts: 12,
          outOfStockParts: 5,
          categories: 8,
          latestParts: [
            { _id: '1', name: 'Въздушен филтър', partNumber: 'AF-1234', quantity: 8, category: 'Филтри' },
            { _id: '2', name: 'Маслен филтър', partNumber: 'OF-4321', quantity: 3, category: 'Филтри' },
            { _id: '3', name: 'Спирачни накладки - предни', partNumber: 'BP-2255', quantity: 2, category: 'Спирачки' },
            { _id: '4', name: 'Акумулатор 60Ah', partNumber: 'BAT-60A', quantity: 0, category: 'Електрически' }
          ]
        });
        setLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [loading, error]);

  // Helper function to get status badge
  const getStatusBadge = (quantity) => {
    if (quantity <= 0) {
      return <span className="badge bg-danger">Изчерпано</span>;
    } else if (quantity <= 5) {
      return <span className="badge bg-warning text-dark">Ниска наличност</span>;
    } else {
      return <span className="badge bg-success">Налично</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Зареждане...</span>
        </div>
        <p className="mt-2">Зареждане на данните...</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </Alert>
      )}

      <div className="mb-4 d-sm-flex align-items-center justify-content-between">
        <h1 className="h3 mb-0">Здравейте, {user ? user.name.split(' ')[0] : 'Потребител'}!</h1>
        <div className="mt-3 mt-sm-0">
          <Link to="/parts/new">
            <Button variant="primary" className="me-2 rounded-pill">
              <i className="fas fa-plus me-1"></i> Добави част
            </Button>
          </Link>
          <Link to="/import-export">
            <Button variant="outline-primary" className="rounded-pill">
              <i className="fas fa-file-import me-1"></i> Импорт/Експорт
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4 g-3">
        <Col md={6} xl={3}>
          <Card className="border-0 shadow-sm h-100 dashboard-card" style={{ 
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2193b0, #6dd5ed)',
            color: 'white'
          }}>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-uppercase mb-1 opacity-75">Общо части</h6>
                  <h2 className="mb-0 fw-bold">{stats.totalParts}</h2>
                </div>
                <div className="p-2 rounded-circle" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <i className="fas fa-cogs fa-2x"></i>
                </div>
              </div>
              <div className="mt-auto pt-3">
                <Link to="/parts" className="text-white">
                  <small>Виж всички <i className="fas fa-arrow-right ms-1"></i></small>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} xl={3}>
          <Card className="border-0 shadow-sm h-100" style={{ 
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ff9a44, #fc6076)',
            color: 'white'
          }}>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-uppercase mb-1 opacity-75">Ниска наличност</h6>
                  <h2 className="mb-0 fw-bold">{stats.lowStockParts}</h2>
                </div>
                <div className="p-2 rounded-circle" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <i className="fas fa-exclamation-triangle fa-2x"></i>
                </div>
              </div>
              <div className="mt-auto pt-3">
                <Link to="/low-stock" className="text-white">
                  <small>Виж всички <i className="fas fa-arrow-right ms-1"></i></small>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} xl={3}>
          <Card className="border-0 shadow-sm h-100" style={{ 
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
            color: 'white'
          }}>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-uppercase mb-1 opacity-75">Категории</h6>
                  <h2 className="mb-0 fw-bold">{stats.categories}</h2>
                </div>
                <div className="p-2 rounded-circle" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <i className="fas fa-tags fa-2x"></i>
                </div>
              </div>
              <div className="mt-auto pt-3">
                <Link to="/parts" className="text-white">
                  <small>Виж всички <i className="fas fa-arrow-right ms-1"></i></small>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} xl={3}>
          <Card className="border-0 shadow-sm h-100" style={{ 
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ff5858, #f09819)',
            color: 'white'
          }}>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-uppercase mb-1 opacity-75">Изчерпани</h6>
                  <h2 className="mb-0 fw-bold">{stats.outOfStockParts}</h2>
                </div>
                <div className="p-2 rounded-circle" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <i className="fas fa-times-circle fa-2x"></i>
                </div>
              </div>
              <div className="mt-auto pt-3">
                <Link to="/parts" className="text-white">
                  <small>Виж всички <i className="fas fa-arrow-right ms-1"></i></small>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Latest Parts */}
      <Row>
        <Col lg={12}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '10px' }}>
            <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <h5 className="mb-0">Последно добавени части</h5>
              <Link to="/parts" className="btn btn-sm btn-outline-primary rounded-pill">
                Виж всички
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Име</th>
                      <th>Номер</th>
                      <th>Категория</th>
                      <th>Статус</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.latestParts.map(part => (
                      <tr key={part._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <div className="icon-box-sm bg-light rounded-circle text-center">
                                <i className="fas fa-cog text-secondary"></i>
                              </div>
                            </div>
                            <div>
                              <h6 className="mb-0">{part.name}</h6>
                              <small className="text-muted">{part.partNumber}</small>
                            </div>
                          </div>
                        </td>
                        <td>{part.partNumber}</td>
                        <td>
                          <span className="badge bg-secondary">{part.category}</span>
                        </td>
                        <td>{getStatusBadge(part.quantity)}</td>
                        <td>
                          <Link to={`/parts/${part._id}`} className="btn btn-sm btn-outline-primary me-1">
                            <i className="fas fa-eye"></i>
                          </Link>
                          <Link to={`/parts/${part._id}/edit`} className="btn btn-sm btn-outline-secondary">
                            <i className="fas fa-edit"></i>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 