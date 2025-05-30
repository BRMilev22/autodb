import React, { useState, useEffect } from 'react';
import { Table, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const LowStockAlert = () => {
  const [lowStockParts, setLowStockParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLowStockParts();
  }, []);

  const fetchLowStockParts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/parts/low-stock');
      setLowStockParts(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load low stock parts. ' + (err.response?.data?.msg || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (loading && lowStockParts.length === 0) {
    return <div className="text-center p-5"><Spinner animation="border" /></div>;
  }

  return (
    <div>
      <Card className="shadow-sm">
        <Card.Header className="bg-warning text-dark d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Low Stock Alerts</h5>
          <div>
            <Button 
              variant="outline-dark" 
              className="me-2"
              onClick={handlePrintReport}>
              <i className="fas fa-print"></i> Print Report
            </Button>
            <Button 
              variant="outline-dark" 
              onClick={fetchLowStockParts}>
              <i className="fas fa-sync-alt"></i> Refresh
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {lowStockParts.length === 0 ? (
            <Alert variant="success">
              <i className="fas fa-check-circle me-2"></i>
              All parts are stocked at sufficient levels.
            </Alert>
          ) : (
            <>
              <Alert variant="warning">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {lowStockParts.length} {lowStockParts.length === 1 ? 'part' : 'parts'} below minimum stock level.
              </Alert>
              
              <Table responsive hover className="mt-3">
                <thead>
                  <tr>
                    <th>Part Name</th>
                    <th>Part Number</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Min Stock Level</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockParts.map(part => (
                    <tr key={part._id}>
                      <td>{part.name}</td>
                      <td>{part.partNumber}</td>
                      <td>{part.category}</td>
                      <td><strong className="text-danger">{part.quantity}</strong> {part.unit}</td>
                      <td>{part.minStockLevel} {part.unit}</td>
                      <td>
                        {part.quantity === 0 ? (
                          <span className="badge bg-danger">Out of Stock</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Low Stock</span>
                        )}
                      </td>
                      <td>
                        <Link to={`/parts/${part._id}`} className="btn btn-sm btn-outline-primary me-1">
                          <i className="fas fa-eye"></i>
                        </Link>
                        <Link to={`/parts/${part._id}/edit`} className="btn btn-sm btn-outline-success">
                          <i className="fas fa-plus"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Card.Body>
      </Card>

      <Card className="mt-4 shadow-sm d-none d-print-block">
        <Card.Body className="text-center">
          <h5>Low Stock Report - {new Date().toLocaleDateString()}</h5>
          <p>Generated by AutoDB Inventory Management System</p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LowStockAlert; 