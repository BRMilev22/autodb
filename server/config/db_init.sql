-- Create the database
CREATE DATABASE IF NOT EXISTS auto_parts_db;
USE auto_parts_db;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create auto parts table
CREATE TABLE IF NOT EXISTS parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  part_number VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  quantity INT NOT NULL DEFAULT 0,
  unit VARCHAR(10) DEFAULT 'бр.',
  price DECIMAL(10, 2),
  manufacturer VARCHAR(100),
  location VARCHAR(100),
  low_stock_threshold INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create stock movement history table
CREATE TABLE IF NOT EXISTS stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  part_id INT NOT NULL,
  quantity_change INT NOT NULL,
  movement_type ENUM('add', 'remove', 'adjustment', 'sale') NOT NULL,
  notes TEXT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@autodb.com', '$2a$10$6hgaZ9aQvizKaQP0VkCM7eVJJY2pKFnGrGXUZCrSHx97Fm0kyzxTq', 'admin');

-- Insert some sample parts with Bulgarian names
INSERT INTO parts (part_number, name, description, category, quantity, unit, price, manufacturer, location, low_stock_threshold)
VALUES 
('BRK-1001', 'Предни спирачни накладки', 'Високоефективни керамични спирачни накладки', 'Спирачки', 45, 'к-т', 89.99, 'Brembo', 'Рафт A1', 15),
('FLT-2020', 'Маслен филтър', 'Стандартен маслен филтър', 'Филтри', 120, 'бр.', 12.99, 'Mann-Filter', 'Рафт B3', 30),
('BAT-3050', 'Акумулатор', '12V акумулатор с 3-годишна гаранция', 'Електрическа система', 25, 'бр.', 129.99, 'Bosch', 'Рафт C2', 10),
('ALT-4100', 'Алтернатор', 'ОЕМ заместител на алтернатор', 'Електрическа система', 18, 'бр.', 199.99, 'Valeo', 'Рафт C1', 8),
('SPK-5001', 'Комплект свещи', 'Иридиеви свещи комплект от 4', 'Двигател', 60, 'к-т', 39.99, 'NGK', 'Рафт D2', 20),
('RAD-6010', 'Радиатор', 'Алуминиев радиатор с пластмасови резервоари', 'Охладителна система', 12, 'бр.', 159.99, 'Nissens', 'Рафт E1', 5);