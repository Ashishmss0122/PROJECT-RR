-- ========================================================
-- SECUREFREELANCE DATABASE SCHEMA
-- ========================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS securefreelance;
USE securefreelance;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  bio TEXT NULL,
  skills TEXT NULL, -- comma-separated tag list
  profileImage VARCHAR(255) NULL,
  isAdmin TINYINT(1) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clientId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  budget DECIMAL(10, 2) NOT NULL,
  deadline DATE NOT NULL,
  requiredSkills TEXT NULL,
  category VARCHAR(100) NOT NULL,
  status ENUM('Open', 'In Progress', 'Completed') DEFAULT 'Open',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clientId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Bids Table
CREATE TABLE IF NOT EXISTS bids (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projectId INT NOT NULL,
  freelancerId INT NOT NULL,
  proposal TEXT NOT NULL,
  bidAmount DECIMAL(10, 2) NOT NULL,
  deliveryTime INT NOT NULL, -- duration in days
  status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (freelancerId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clientId INT NOT NULL,
  freelancerId INT NOT NULL,
  projectId INT NOT NULL,
  agreedAmount DECIMAL(10, 2) NOT NULL,
  deliveryDate DATE NOT NULL,
  contractStatus ENUM('Active', 'Submitted', 'Completed') DEFAULT 'Active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clientId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (freelancerId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  senderId INT NOT NULL,
  receiverId INT NOT NULL,
  projectId INT NULL,
  messageText TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Payments Table (Escrow State Ledger)
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contractId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paymentStatus ENUM('Pending', 'Released', 'Completed') DEFAULT 'Pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contractId) REFERENCES contracts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Uploaded Files Table
CREATE TABLE IF NOT EXISTS uploaded_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contractId INT NOT NULL,
  uploadedById INT NOT NULL,
  fileName VARCHAR(255) NOT NULL,
  filePath VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contractId) REFERENCES contracts(id) ON DELETE CASCADE,
  FOREIGN KEY (uploadedById) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ========================================================
-- DUMMY SEED DATA
-- ========================================================

-- Passwords hashed using bcrypt (cost=10)
-- Password for all mock accounts is: password123 (Hash: $2a$10$w3/vUaP9v1kR6aF7lQyNse1L/nOaswB1k74.tW5kEaC7iA37b.p9y)

INSERT INTO users (fullName, email, password, bio, skills, profileImage, isAdmin) 
VALUES 
('Alice Admin', 'admin@securefreelance.com', '$2a$10$w3/vUaP9v1kR6aF7lQyNse1L/nOaswB1k74.tW5kEaC7iA37b.p9y', 'Platform Administrator. Keeps operations running safely.', 'SQL, Management, Systems Control', '/uploads/default-avatar.png', 1),
('David Client', 'client@securefreelance.com', '$2a$10$w3/vUaP9v1kR6aF7lQyNse1L/nOaswB1k74.tW5kEaC7iA37b.p9y', 'Looking for high quality developers to scale our dashboard APIs.', 'Product Management, Venture Design', '/uploads/default-avatar.png', 0),
('Bob Freelancer', 'freelancer@securefreelance.com', '$2a$10$w3/vUaP9v1kR6aF7lQyNse1L/nOaswB1k74.tW5kEaC7iA37b.p9y', 'Seasoned Node.js developer, specializing in database optimization.', 'Node.js, Express, MySQL, REST APIs', '/uploads/default-avatar.png', 0);

-- Insert Open Projects
INSERT INTO projects (clientId, title, description, budget, deadline, requiredSkills, category, status) 
VALUES 
(2, 'Optimize Express API and MySQL Indexes', 'We are experiencing query latencies on our primary analytics dashboard. We need a MySQL DBA or Backend Specialist to review our indexes, optimize active connections, and refactor our Express routes.', 800.00, '2026-07-01', 'Node.js, MySQL, Database Optimization', 'Development', 'Open'),
(2, 'Create Glassmorphic Figma Design Bundle', 'Looking for a UI designer to construct 15 vector screens for a next-gen dashboard application. Must follow dark theme guidelines, sleek gradients, and outline styled components.', 400.00, '2026-06-20', 'Figma, UI Design, Brand Identity', 'Design', 'Open');

-- Insert Bids
INSERT INTO bids (projectId, freelancerId, proposal, bidAmount, deliveryTime, status) 
VALUES 
(1, 3, 'Hello David, I can refactor your Express application and check index efficiency in 5 days. I have optimized MySQL pipelines for ecommerce sites in the past.', 750.00, 5, 'Pending');
