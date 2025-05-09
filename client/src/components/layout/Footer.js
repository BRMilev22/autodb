import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="text-center py-4" style={{ 
      background: 'linear-gradient(135deg, #1c1c1c, #2c2c2c)',
      color: '#f0f0f0',
      borderTop: '1px solid rgba(255,255,255,0.05)'
    }}>
      <Container>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div>
            <span className="d-flex align-items-center justify-content-center justify-content-md-start mb-2 mb-md-0">
              <i className="fas fa-car-battery me-2"></i>
              <strong>АвтоДБ</strong> &copy; {year}
            </span>
          </div>
          
          <div className="d-flex gap-3">
            <a href="#!" className="text-decoration-none" style={{ color: '#f0f0f0' }}>
              <i className="fas fa-question-circle me-1"></i> Помощ
            </a>
            <a href="#!" className="text-decoration-none" style={{ color: '#f0f0f0' }}>
              <i className="fas fa-file-alt me-1"></i> Документация
            </a>
            <a href="#!" className="text-decoration-none" style={{ color: '#f0f0f0' }}>
              <i className="fas fa-envelope me-1"></i> Контакти
            </a>
          </div>
        </div>
        
        <div className="mt-3" style={{ fontSize: '0.8rem', opacity: '0.7' }}>
          <p className="mb-0">Система за управление на автомобилни части и инвентаризация</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 