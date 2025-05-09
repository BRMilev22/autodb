import React, { useState } from 'react';
import { Card, Form, Button, Alert, Tabs, Tab, Spinner, ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import { CSVLink } from 'react-csv';

const ImportExport = () => {
  // Export state
  const [exportData, setExportData] = useState([]);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(null);
  
  // Import state
  const [file, setFile] = useState(null);
  const [importFormat, setImportFormat] = useState('csv');
  const [importProgress, setImportProgress] = useState(0);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);
  
  // Handle export action
  const handleExport = async () => {
    try {
      setExportLoading(true);
      setExportError(null);
      
      const res = await axios.get('/api/parts/export');
      setExportData(res.data);
    } catch (err) {
      setExportError('Failed to export data. ' + (err.response?.data?.msg || err.message));
      console.error(err);
    } finally {
      setExportLoading(false);
    }
  };
  
  // Handle import file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };
  
  // Handle import submission
  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setImportError('Please select a file to import.');
      return;
    }
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', importFormat);
    
    try {
      setImportLoading(true);
      setImportError(null);
      setImportSuccess(null);
      setImportProgress(0);
      
      // Upload with progress tracking
      const response = await axios.post('/api/parts/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setImportProgress(percentCompleted);
        }
      });
      
      setImportSuccess(`Successfully imported ${response.data.count} parts.`);
      setFile(null);
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (err) {
      setImportError('Import failed. ' + (err.response?.data?.msg || err.message));
      console.error(err);
    } finally {
      setImportLoading(false);
    }
  };
  
  // Download template function
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        name: 'Example Part',
        partNumber: 'ABC123',
        manufacturer: 'Example Manufacturer',
        description: 'This is an example part description',
        category: 'Engine',
        location: 'Shelf A1',
        quantity: 10,
        unit: 'pcs',
        price: 99.99,
        minStockLevel: 5
      }
    ];
    setExportData(templateData);
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Import & Export Data</h5>
      </Card.Header>
      <Card.Body>
        <Tabs defaultActiveKey="export" id="import-export-tabs" className="mb-4">
          {/* Export Tab */}
          <Tab eventKey="export" title="Export Data">
            <Card className="border-0">
              <Card.Body>
                <p className="mb-4">
                  Export your parts inventory data for backup or to use in other systems.
                </p>
                
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Export Format</Form.Label>
                    <Form.Select 
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                    >
                      <option value="csv">CSV (.csv)</option>
                      <option value="json">JSON (.json)</option>
                      <option value="excel">Excel (.xlsx)</option>
                    </Form.Select>
                  </Form.Group>
                  
                  {exportError && (
                    <Alert variant="danger" className="mb-3">
                      {exportError}
                    </Alert>
                  )}
                  
                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary" 
                      onClick={handleExport}
                      disabled={exportLoading}
                    >
                      {exportLoading ? (
                        <Spinner as="span" animation="border" size="sm" />
                      ) : (
                        <>
                          <i className="fas fa-file-export me-2"></i>
                          Export All Parts
                        </>
                      )}
                    </Button>
                    
                    {exportData.length > 0 && exportFormat === 'csv' && (
                      <CSVLink
                        data={exportData}
                        filename={`parts-export-${new Date().toISOString().split('T')[0]}.csv`}
                        className="btn btn-success"
                        target="_blank"
                      >
                        <i className="fas fa-download me-2"></i>
                        Download CSV
                      </CSVLink>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Tab>
          
          {/* Import Tab */}
          <Tab eventKey="import" title="Import Data">
            <Card className="border-0">
              <Card.Body>
                <p className="mb-4">
                  Import parts inventory data from a file. Make sure your file matches the expected format.
                </p>
                
                <Form onSubmit={handleImport}>
                  <Form.Group className="mb-3">
                    <Form.Label>File Format</Form.Label>
                    <Form.Select 
                      value={importFormat}
                      onChange={(e) => setImportFormat(e.target.value)}
                    >
                      <option value="csv">CSV (.csv)</option>
                      <option value="json">JSON (.json)</option>
                      <option value="excel">Excel (.xlsx)</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Select File</Form.Label>
                    <Form.Control
                      id="file-input"
                      type="file"
                      accept={
                        importFormat === 'csv' ? '.csv' : 
                        importFormat === 'json' ? '.json' : '.xlsx'
                      }
                      onChange={handleFileChange}
                      required
                    />
                    <Form.Text className="text-muted">
                      Maximum file size: 10MB
                    </Form.Text>
                  </Form.Group>
                  
                  {importLoading && (
                    <div className="mb-3">
                      <ProgressBar 
                        now={importProgress} 
                        label={`${importProgress}%`} 
                        animated 
                      />
                    </div>
                  )}
                  
                  {importError && (
                    <Alert variant="danger" className="mb-3">
                      {importError}
                    </Alert>
                  )}
                  
                  {importSuccess && (
                    <Alert variant="success" className="mb-3">
                      {importSuccess}
                    </Alert>
                  )}
                  
                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={importLoading || !file}
                    >
                      {importLoading ? (
                        <Spinner as="span" animation="border" size="sm" />
                      ) : (
                        <>
                          <i className="fas fa-file-import me-2"></i>
                          Import Data
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline-secondary"
                      onClick={handleDownloadTemplate}
                    >
                      <i className="fas fa-file-download me-2"></i>
                      Download Template
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  );
};

export default ImportExport; 