import React, { useState } from 'react';
import { Button, Modal, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';

// Reusable component for stock actions (add and sell buttons)
const StockActionButtons = ({ part, onStockUpdated, buttonSize = '' }) => {
  const [addModal, setAddModal] = useState(false);
  const [sellModal, setSellModal] = useState(false);
  const [addQuantity, setAddQuantity] = useState(1);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [error, setError] = useState(null);

  const handleAddStock = async () => {
    try {
      setProcessingAction(true);
      await axios.put(`/api/parts/${part._id}/stock`, {
        quantity_change: addQuantity,
        notes: notes || 'Добавяне на количество',
        movement_type: 'add'
      });
      
      setAddModal(false);
      setAddQuantity(1);
      setNotes('');
      if (onStockUpdated) onStockUpdated();
    } catch (err) {
      setError('Грешка при обновяване на количеството. ' + (err.response?.data?.msg || err.message));
      console.error(err);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleSell = async () => {
    try {
      setProcessingAction(true);
      await axios.patch(`/api/parts/${part._id}/sell`, {
        quantity: sellQuantity,
        notes: notes || 'Продажба'
      });
      
      setSellModal(false);
      setSellQuantity(1);
      setNotes('');
      if (onStockUpdated) onStockUpdated();
    } catch (err) {
      setError('Грешка при обновяване на количеството. ' + (err.response?.data?.msg || err.message));
      console.error(err);
    } finally {
      setProcessingAction(false);
    }
  };

  const resetModal = () => {
    setNotes('');
    setError(null);
    setAddQuantity(1);
    setSellQuantity(1);
  };

  return (
    <>
      <Button 
        variant="success" 
        className="me-2"
        size={buttonSize}
        onClick={() => {
          resetModal();
          setAddModal(true);
        }}
      >
        <i className="fas fa-plus"></i> Добави
      </Button>

      <Button 
        variant="warning" 
        size={buttonSize}
        onClick={() => {
          resetModal();
          setSellModal(true);
        }}
        disabled={part.quantity <= 0}
      >
        <i className="fas fa-minus"></i> Продай
      </Button>

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
                onChange={(e) => setAddQuantity(parseInt(e.target.value || 0))}
              />
            </Form.Group>
            
            <Form.Group>
              <Form.Label>Бележка (незадължително)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Въведете информация за доставката"
              />
            </Form.Group>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
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
                onChange={(e) => setSellQuantity(parseInt(e.target.value || 0))}
              />
            </Form.Group>
            
            <Form.Group>
              <Form.Label>Бележка (незадължително)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Въведете бележка за продажбата"
              />
            </Form.Group>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
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
    </>
  );
};

export default StockActionButtons; 