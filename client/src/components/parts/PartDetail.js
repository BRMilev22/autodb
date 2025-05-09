import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const PartDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellModal, setSellModal] = useState(false);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [sellNotes, setSellNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [history, setHistory] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [addQuantity, setAddQuantity] = useState(1);
  const [addNotes, setAddNotes] = useState('');
  
  useEffect(() => {
    fetchPartDetails();
  }, [id]);
  
  const fetchPartDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/parts/${id}`);
      setPart(res.data);
      
      // Fetch stock history
      try {
        const historyRes = await axios.get(`/api/parts/${id}/history`);
        setHistory(historyRes.data);
      } catch (histErr) {
        console.error('Failed to load stock history:', histErr);
        // Don't set main error here, just log it
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load part details. ' + (err.response?.data?.msg || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const getStockStatusBadge = (quantity) => {
    if (quantity <= 0) {
      return <Badge bg="danger">Изчерпано</Badge>;
    } else if (quantity <= 5) {
      return <Badge bg="warning" text="dark">Ниска наличност</Badge>;
    } else {
      return <Badge bg="success">Налично</Badge>;
    }
  };
  
  const handleSell = async () => {
    try {
      setProcessingAction(true);
      await axios.patch(`/api/parts/${id}/sell`, {
        quantity: sellQuantity,
        notes: sellNotes || 'Продажба'
      });
      
      // Refresh part details
      fetchPartDetails();
      
      // Close modal
      setSellModal(false);
      setSellQuantity(1);
      setSellNotes('');
    } catch (err) {
      setError('Failed to update stock. ' + (err.response?.data?.msg || err.message));
      console.error(err);
    } finally {
      setProcessingAction(false);
    }
  };
  
  const handleAddStock = async () => {
    try {
      setProcessingAction(true);
      await axios.put(`/api/parts/${id}/stock`, {
        quantity_change: addQuantity,
        notes: addNotes || 'Добавяне на количество',
        movement_type: 'add'
      });
      
      // Refresh part details
      fetchPartDetails();
      
      // Close modal
      setAddModal(false);
      setAddQuantity(1);
      setAddNotes('');
    } catch (err) {
      setError('Failed to update stock. ' + (err.response?.data?.msg || err.message));
      console.error(err);
    } finally {
      setProcessingAction(false);
    }
  };
  
  if (loading) {
    return <div className="text-center p-5"><Spinner animation="border" /></div>;
  }
  
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }
  
  if (!part) {
    return <Alert variant="warning">Частта не е намерена.</Alert>;
  }
  
  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Детайли за частта</h5>
        <div>
          <Link to={`/parts/${id}/edit`} className="btn btn-light btn-sm me-2">
            <i className="fas fa-edit"></i> Редактирай
          </Link>
          <Button 
            variant="light" 
            size="sm" 
            onClick={() => navigate('/parts')}
          >
            <i className="fas fa-arrow-left"></i> Назад
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <h4>{part.name}</h4>
            <p className="text-muted">{part.partNumber}</p>
            
            <div className="mb-3">
              {getStockStatusBadge(part.quantity)}
              <Badge bg="secondary" className="ms-2">
                {part.category}
              </Badge>
            </div>
            
            <p>{part.description}</p>
            
            <hr />
            
            <Row className="mt-4">
              <Col xs={6} className="mb-3">
                <strong>Производител:</strong>
                <p>{part.manufacturer || 'Не е посочен'}</p>
              </Col>
              <Col xs={6} className="mb-3">
                <strong>Местоположение:</strong>
                <p>{part.location || 'Не е посочено'}</p>
              </Col>
              <Col xs={6} className="mb-3">
                <strong>Количество:</strong>
                <p>{part.quantity} {part.unit || 'бр.'}</p>
              </Col>
              <Col xs={6} className="mb-3">
                <strong>Цена:</strong>
                <p>{parseFloat(part.price).toFixed(2)} лв.</p>
              </Col>
            </Row>
          </Col>
          
          <Col md={6}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">История на инвентара</h6>
              </Card.Header>
              <Card.Body style={{ maxHeight: '300px', overflow: 'auto' }}>
                {history && history.length > 0 ? (
                  <ul className="list-group">
                    {history.map((record, index) => (
                      <li key={index} className="list-group-item">
                        <div className="d-flex justify-content-between">
                          <span>
                            <Badge bg={record.type === 'add' || record.quantity > 0 ? 'success' : 'danger'}>
                              {record.quantity > 0 ? '+' : ''}{record.quantity}
                            </Badge>
                            {' '}{record.note || 'Няма бележка'}
                          </span>
                          <small className="text-muted">
                            {new Date(record.date).toLocaleDateString()} - {record.user || 'Система'}
                          </small>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">Няма налична история</p>
                )}
              </Card.Body>
            </Card>
            
            <Card className="mt-3">
              <Card.Header>
                <h6 className="mb-0">Бързи действия</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col xs={6}>
                    <Button 
                      variant="success" 
                      className="w-100 mb-2"
                      onClick={() => setAddModal(true)}
                    >
                      <i className="fas fa-plus"></i> Добави
                    </Button>
                  </Col>
                  <Col xs={6}>
                    <Button 
                      variant="warning" 
                      className="w-100 mb-2"
                      onClick={() => setSellModal(true)}
                      disabled={part.quantity <= 0}
                    >
                      <i className="fas fa-minus"></i> Продай
                    </Button>
                  </Col>
                  <Col xs={12}>
                    <Button variant="outline-primary" className="w-100">
                      <i className="fas fa-print"></i> Принтирай баркод
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
      
      {/* Sell Modal */}
      <Modal show={sellModal} onHide={() => setSellModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Продажба на част</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Част</Form.Label>
              <Form.Control type="text" value={part.name} disabled />
              <Form.Text className="text-muted">
                Налично количество: {part.quantity} {part.unit || 'бр.'}
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Количество за продажба</Form.Label>
              <Form.Control 
                type="number" 
                min="1" 
                max={part.quantity} 
                value={sellQuantity} 
                onChange={(e) => setSellQuantity(parseInt(e.target.value))}
              />
            </Form.Group>
            
            <Form.Group>
              <Form.Label>Бележка (незадължително)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                value={sellNotes} 
                onChange={(e) => setSellNotes(e.target.value)}
                placeholder="Въведете бележка за продажбата"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSellModal(false)}>
            Отказ
          </Button>
          <Button 
            variant="warning" 
            onClick={handleSell}
            disabled={processingAction || sellQuantity <= 0 || sellQuantity > part.quantity}
          >
            {processingAction ? 
              <><Spinner as="span" animation="border" size="sm" /> Изпълнява се...</> : 
              <>Продай</>
            }
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Add Stock Modal */}
      <Modal show={addModal} onHide={() => setAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Добавяне на количество</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Част</Form.Label>
              <Form.Control type="text" value={part.name} disabled />
              <Form.Text className="text-muted">
                Текущо количество: {part.quantity} {part.unit || 'бр.'}
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Количество за добавяне</Form.Label>
              <Form.Control 
                type="number" 
                min="1" 
                value={addQuantity} 
                onChange={(e) => setAddQuantity(parseInt(e.target.value))}
              />
            </Form.Group>
            
            <Form.Group>
              <Form.Label>Бележка (незадължително)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                value={addNotes} 
                onChange={(e) => setAddNotes(e.target.value)}
                placeholder="Въведете информация за доставката"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAddModal(false)}>
            Отказ
          </Button>
          <Button 
            variant="success" 
            onClick={handleAddStock}
            disabled={processingAction || addQuantity <= 0}
          >
            {processingAction ? 
              <><Spinner as="span" animation="border" size="sm" /> Изпълнява се...</> : 
              <>Добави</>
            }
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default PartDetail; 