import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const categories = [
  'Двигател', 'Трансмисия', 'Електрическа система', 'Спирачки', 'Окачване',
  'Охладителна система', 'Климатична система', 'Каросерия', 'Интериор', 'Аксесоари', 'Други'
];

const PartForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    partNumber: '',
    manufacturer: '',
    description: '',
    category: '',
    location: '',
    quantity: 0,
    unit: 'бр.',
    price: 0,
    minStockLevel: 5
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [success, setSuccess] = useState(null);

  const fetchPart = useCallback(async () => {
    if (!isEditMode) return;
    
    try {
      setLoading(true);
      const res = await axios.get(`/api/parts/${id}`);
      setFormData({
        name: res.data.name || '',
        partNumber: res.data.partNumber || '',
        manufacturer: res.data.manufacturer || '',
        description: res.data.description || '',
        category: res.data.category || '',
        location: res.data.location || '',
        quantity: res.data.quantity || 0,
        unit: res.data.unit || 'бр.',
        price: res.data.price || 0,
        minStockLevel: res.data.minStockLevel || 5
      });
      setError(null);
    } catch (err) {
      setError('Грешка при зареждане на данните за частта. ' + (err.response?.data?.msg || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    fetchPart();
  }, [fetchPart]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setError(null);
    setValidationErrors([]);
    
    // Basic validation
    const errors = [];
    if (!formData.name.trim()) errors.push('Име на частта е задължително');
    if (!formData.partNumber.trim()) errors.push('Номер на частта е задължително');
    if (!formData.category) errors.push('Категория е задължително');
    if (formData.price === '') errors.push('Цена е задължително');
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Ensure numeric fields are properly formatted
    const dataToSubmit = {
      ...formData,
      quantity: parseInt(formData.quantity) || 0,
      price: parseFloat(formData.price) || 0,
      minStockLevel: parseInt(formData.minStockLevel) || 0
    };
    
    try {
      setLoading(true);
      
      if (isEditMode) {
        await axios.put(`/api/parts/${id}`, dataToSubmit);
        setSuccess('Частта е обновена успешно!');
      } else {
        await axios.post('/api/parts', dataToSubmit);
        setSuccess('Частта е създадена успешно!');
        // Reset form if adding new part
        if (!isEditMode) {
          setFormData({
            name: '',
            partNumber: '',
            manufacturer: '',
            description: '',
            category: '',
            location: '',
            quantity: 0,
            unit: 'бр.',
            price: 0,
            minStockLevel: 5
          });
        }
      }
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate(isEditMode ? `/parts/${id}` : '/parts');
      }, 1500);
      
    } catch (err) {
      if (err.response?.data?.errors) {
        // Handle validation errors from the server
        const serverErrors = err.response.data.errors.map(error => error.msg);
        setValidationErrors(serverErrors);
      } else if (err.response?.data?.msg) {
        // Handle specific error message
        setError(err.response.data.msg);
      } else {
        setError('Грешка при запазване на частта: ' + err.message);
      }
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
        <h5 className="mb-0">{isEditMode ? 'Редактиране на част' : 'Добавяне на нова част'}</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {validationErrors.length > 0 && (
          <Alert variant="danger">
            <p className="mb-1">Моля, коригирайте следните грешки:</p>
            <ul className="mb-0 ps-3">
              {validationErrors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </Alert>
        )}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Име на частта</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Въведете име на частта"
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Номер на частта</Form.Label>
                <Form.Control
                  type="text"
                  name="partNumber"
                  value={formData.partNumber}
                  onChange={handleChange}
                  required
                  placeholder="Въведете номер на частта"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Производител</Form.Label>
                <Form.Control
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="Въведете производител"
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Категория</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Изберете категория</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Въведете описание на частта"
            />
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Местоположение</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Въведете местоположение (рафт, кутия)"
                />
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Количество</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Мерна единица</Form.Label>
                <Form.Select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                >
                  <option value="бр.">бройки</option>
                  <option value="м">метри</option>
                  <option value="кг">килограми</option>
                  <option value="л">литри</option>
                  <option value="к-т">комплекти</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Цена (лв.)</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Минимално ниво на запас</Form.Label>
                <Form.Control
                  type="number"
                  name="minStockLevel"
                  value={formData.minStockLevel}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                />
                <Form.Text className="text-muted">
                  Системата ще алармира, когато запасът падне под това ниво.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-between mt-4">
            <Button variant="secondary" onClick={() => navigate(isEditMode ? `/parts/${id}` : '/parts')}>
              Отказ
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" /> : isEditMode ? 'Обнови част' : 'Добави част'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PartForm; 