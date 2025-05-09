import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Table, Form, InputGroup, Badge, Pagination, Modal, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const PartsList = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [categories, setCategories] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, partId: null });
  const [totalParts, setTotalParts] = useState(0);
  
  // Pagination settings
  const partsPerPage = 10;
  
  // Fetch parts based on current filters and pagination
  useEffect(() => {
    fetchParts();
  }, [searchTerm, categoryFilter, sortField, sortDirection, currentPage]);
  
  // Fetch categories once on component mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/parts/categories');
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };
  
  const fetchParts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        search: searchTerm,
        sortBy: sortField,
        sortOrder: sortDirection,
      };
      
      if (categoryFilter) {
        params.category = categoryFilter;
      }
      
      const res = await axios.get('/api/parts', { params });
      setParts(res.data);
      setTotalParts(res.data.length);
      setError(null);
    } catch (err) {
      setError('Грешка при зареждането на частите. ' + (err.response?.data?.msg || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Pagination logic
  const indexOfLastPart = currentPage * partsPerPage;
  const indexOfFirstPart = indexOfLastPart - partsPerPage;
  const currentParts = parts.slice(indexOfFirstPart, indexOfLastPart);
  const totalPages = Math.ceil(parts.length / partsPerPage);
  
  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Important: When paginating, make sure we stay on the first page when searching
    if (searchTerm) {
      setCurrentPage(1);
    }
  };
  
  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };
  
  // Handle search input with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when search changes
  };
  
  // Handle category filter change
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategoryFilter(value);
    setCurrentPage(1); // Reset to first page when category changes
  };
  
  // Delete handler
  const handleDelete = async () => {
    if (!confirmDelete.partId) return;
    
    try {
      await axios.delete(`/api/parts/${confirmDelete.partId}`);
      // Refresh the list after deletion
      fetchParts();
      setConfirmDelete({ show: false, partId: null });
    } catch (err) {
      setError('Грешка при изтриване на част. ' + (err.response?.data?.msg || err.message));
      console.error(err);
    }
  };
  
  // Get stock status badge
  const getStockBadge = (quantity) => {
    if (quantity <= 0) {
      return <Badge bg="danger">Изчерпано</Badge>;
    } else if (quantity <= 5) {
      return <Badge bg="warning" text="dark">Ниска наличност</Badge>;
    } else {
      return <Badge bg="success">Налично</Badge>;
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSortField('name');
    setSortDirection('asc');
    setCurrentPage(1);
  };
  
  if (loading && parts.length === 0) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Зареждане на части...</p>
      </div>
    );
  }
  
  return (
    <div>
      <Card className="shadow-sm border-0" style={{ borderRadius: '10px' }}>
        <Card.Header className="bg-white d-sm-flex justify-content-between align-items-center py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h5 className="mb-3 mb-sm-0">Списък с части</h5>
          <div>
            <Link to="/parts/new" className="btn btn-primary rounded-pill me-2">
              <i className="fas fa-plus me-1"></i> Нова част
            </Link>
            <Button 
              variant="outline-secondary" 
              className="rounded-pill"
              onClick={resetFilters}
            >
              <i className="fas fa-redo me-1"></i> Изчисти филтрите
            </Button>
          </div>
        </Card.Header>
        
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <div className="row mb-4">
            <div className="col-md-6 mb-3 mb-md-0">
              <InputGroup>
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Търсене по име, номер или описание"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </div>
            <div className="col-md-6">
              <InputGroup>
                <InputGroup.Text>
                  <i className="fas fa-filter"></i>
                </InputGroup.Text>
                <Form.Select
                  value={categoryFilter}
                  onChange={handleCategoryChange}
                >
                  <option value="">Всички категории</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </div>
          </div>
          
          {parts.length === 0 ? (
            <Alert variant="info">
              <i className="fas fa-info-circle me-2"></i>
              Няма намерени части отговарящи на критериите. {' '}
              <Button variant="link" className="p-0" onClick={resetFilters}>
                Изчисти филтрите
              </Button>
            </Alert>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover striped className="align-middle">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                        Име {sortField === 'name' && (
                          <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('partNumber')} style={{ cursor: 'pointer' }}>
                        Номер {sortField === 'partNumber' && (
                          <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
                        Категория {sortField === 'category' && (
                          <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('quantity')} style={{ cursor: 'pointer' }}>
                        Количество {sortField === 'quantity' && (
                          <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                        Цена {sortField === 'price' && (
                          <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th>Статус</th>
                      <th className="text-center">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentParts.map((part) => (
                      <tr key={part._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <div className="icon-box-sm bg-light rounded-circle text-center d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                <i className="fas fa-cog text-secondary"></i>
                              </div>
                            </div>
                            <div>
                              <Link to={`/parts/${part._id}`} className="text-decoration-none">
                                <strong>{part.name}</strong>
                              </Link>
                              {part.manufacturer && (
                                <small className="d-block text-muted">{part.manufacturer}</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{part.partNumber}</td>
                        <td>
                          {part.category ? (
                            <Badge bg="secondary" className="rounded-pill px-3 py-2">
                              {part.category}
                            </Badge>
                          ) : '-'}
                        </td>
                        <td>{part.quantity} {part.unit || 'бр.'}</td>
                        <td>{parseFloat(part.price).toFixed(2)} лв.</td>
                        <td>{getStockBadge(part.quantity)}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-1">
                            <Link to={`/parts/${part._id}`} className="btn btn-sm btn-outline-primary">
                              <i className="fas fa-eye"></i>
                            </Link>
                            <Link to={`/parts/${part._id}/edit`} className="btn btn-sm btn-outline-secondary">
                              <i className="fas fa-edit"></i>
                            </Link>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => setConfirmDelete({ show: true, partId: part._id })}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-muted">
                  Показване на {indexOfFirstPart + 1}-{Math.min(indexOfLastPart, parts.length)} от {parts.length} части
                </small>
                
                {totalPages > 1 && (
                  <Pagination>
                    <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      // Show current page, 2 before and 2 after when possible
                      if (
                        pageNum === 1 || 
                        pageNum === totalPages || 
                        (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                      ) {
                        return (
                          <Pagination.Item 
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => paginate(pageNum)}
                          >
                            {pageNum}
                          </Pagination.Item>
                        );
                      } else if (
                        (pageNum === currentPage - 3 && currentPage > 3) || 
                        (pageNum === currentPage + 3 && currentPage < totalPages - 2)
                      ) {
                        return <Pagination.Ellipsis key={pageNum} />;
                      }
                      return null;
                    })}
                    
                    <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
                  </Pagination>
                )}
              </div>
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal show={confirmDelete.show} onHide={() => setConfirmDelete({ show: false, partId: null })}>
        <Modal.Header closeButton>
          <Modal.Title>Потвърждение за изтриване</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Сигурни ли сте, че искате да изтриете тази част? Това действие не може да бъде отменено.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setConfirmDelete({ show: false, partId: null })}>
            Отказ
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Изтрий
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PartsList; 