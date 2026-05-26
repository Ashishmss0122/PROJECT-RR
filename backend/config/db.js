const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

let pool = null;

async function getPool() {
  if (pool) return pool;

  // First, connect without specifying a database to ensure it exists
  const connection = await mysql.createConnection({
    host: DB_HOST || 'localhost',
    port: parseInt(DB_PORT || '3306'),
    user: DB_USER || 'root',
    password: DB_PASSWORD || 'ashish0122'
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME || 'securefreelance'}\``);
  await connection.end();

  // Create the pool with the specific database
  pool = mysql.createPool({
    host: DB_HOST || 'localhost',
    port: parseInt(DB_PORT || '3306'),
    user: DB_USER || 'root',
    password: DB_PASSWORD || 'ashish0122',
    database: DB_NAME || 'securefreelance',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  return pool;
}

async function initializeDatabase() {
  try {
    const currentPool = await getPool();
    console.log('Connected to MySQL server. Initializing tables...');

    // 1. Create Users
    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        bio TEXT NULL,
        skills TEXT NULL,
        profileImage VARCHAR(255) NULL,
        isAdmin TINYINT(1) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 2. Create Projects
    await currentPool.query(`
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
    `);

    // 3. Create Bids
    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id INT AUTO_INCREMENT PRIMARY KEY,
        projectId INT NOT NULL,
        freelancerId INT NOT NULL,
        proposal TEXT NOT NULL,
        bidAmount DECIMAL(10, 2) NOT NULL,
        deliveryTime INT NOT NULL,
        status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (freelancerId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 4. Create Contracts
    await currentPool.query(`
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
    `);

    // 5. Create Messages
    await currentPool.query(`
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
    `);

    // 6. Create Payments
    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contractId INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        paymentStatus ENUM('Pending', 'Released', 'Completed') DEFAULT 'Pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contractId) REFERENCES contracts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 7. Create Uploaded Files
    await currentPool.query(`
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
    `);

    console.log('Tables initialized successfully.');

    // Seed database if empty
    const [rows] = await currentPool.query('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      console.log('Database empty. Seeding initial data...');
      await seedDatabase(currentPool);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

async function seedDatabase(dbPool) {
  // Hash passwords
  const salt = bcrypt.genSaltSync(10);
  const adminPassword = bcrypt.hashSync('admin123', salt);
  const clientPassword = bcrypt.hashSync('client123', salt);
  const freelancerPassword = bcrypt.hashSync('freelancer123', salt);
  const developerPassword = bcrypt.hashSync('dev123', salt);

  // 1. Seed Users
  const [adminResult] = await dbPool.query(`
    INSERT INTO users (fullName, email, password, bio, skills, profileImage, isAdmin)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, ['Admin User', 'admin@securefreelance.com', adminPassword, 'System Administrator. Monitoring contracts and keeping the platform safe.', 'Management, Moderation, SQL', '/uploads/default-avatar.png', 1]);

  const [clientResult] = await dbPool.query(`
    INSERT INTO users (fullName, email, password, bio, skills, profileImage, isAdmin)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, ['Alice Client', 'client@securefreelance.com', clientPassword, 'Product Manager looking for React/Node.js talent to build enterprise dashboards.', 'Management, Strategy', '/uploads/default-avatar.png', 0]);

  const [freelancerResult] = await dbPool.query(`
    INSERT INTO users (fullName, email, password, bio, skills, profileImage, isAdmin)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, ['Bob Freelancer', 'freelancer@securefreelance.com', freelancerPassword, 'Full Stack Web Developer specializing in custom SaaS products, React frameworks, and server integrations.', 'React, Express, Node.js, Tailwind CSS, MySQL', '/uploads/default-avatar.png', 0]);

  const [devResult] = await dbPool.query(`
    INSERT INTO users (fullName, email, password, bio, skills, profileImage, isAdmin)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, ['Charlie Dev', 'dev@securefreelance.com', developerPassword, 'UI/UX Designer and Frontend Specialist with a passion for glassmorphic elements and clean aesthetics.', 'Figma, Tailwind CSS, UI Design, React', '/uploads/default-avatar.png', 0]);

  const adminId = adminResult.insertId;
  const clientId = clientResult.insertId;
  const freelancerId = freelancerResult.insertId;
  const devId = devResult.insertId;

  // 2. Seed Projects (Client posts them)
  const [proj1] = await dbPool.query(`
    INSERT INTO projects (clientId, title, description, budget, deadline, requiredSkills, category, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    clientId,
    'Build a Glassmorphic SaaS Dashboard',
    'We are looking for a skilled developer to build a modern SaaS analytics dashboard. The design should utilize deep colors, glassmorphic cards, and smooth micro-animations. It needs to read data from a REST API and render beautiful charts. Experience with React, Tailwind CSS, and ChartJS/Recharts is required.',
    1200.00,
    '2026-07-15',
    'React, Tailwind CSS, Chart.js',
    'Development',
    'Open'
  ]);

  const [proj2] = await dbPool.query(`
    INSERT INTO projects (clientId, title, description, budget, deadline, requiredSkills, category, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    clientId,
    'Design Logo & Brand Book for SecureFreelance',
    'Need a high-end vector logo, typography selection, and color palette document for our new platform "SecureFreelance". The logo should represent security, speed, and trust. Deliverables must include SVG, PNG, and Adobe Illustrator source files.',
    350.00,
    '2026-06-30',
    'UI Design, Figma, Logo Design',
    'Design',
    'Open'
  ]);

  const [proj3] = await dbPool.query(`
    INSERT INTO projects (clientId, title, description, budget, deadline, requiredSkills, category, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    freelancerId, // Freelancer acting as client
    'Refactor MySQL Database Schemas',
    'Looking for an experienced database administrator to audit and optimize our indexing structure, verify foreign key cascades, and rewrite query logs to decrease latency. High scalability experience is a plus.',
    500.00,
    '2026-08-01',
    'MySQL, Database Optimization, SQL',
    'Database',
    'Open'
  ]);

  // 3. Seed Bids
  // Bob freelancer bids on Alice's Glassmorphic SaaS Dashboard project
  await dbPool.query(`
    INSERT INTO bids (projectId, freelancerId, proposal, bidAmount, deliveryTime, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    proj1.insertId,
    freelancerId,
    'Hi Alice, I am a seasoned full stack developer and have created multiple React/Tailwind dashboards. I love modern glassmorphic designs and can deliver this dashboard fully functional in 10 days. I have built similar systems using Recharts for visual analytics. Looking forward to working together!',
    1100.00,
    10,
    'Pending'
  ]);

  // Charlie Dev bids on Alice's Glassmorphic SaaS Dashboard project
  await dbPool.query(`
    INSERT INTO bids (projectId, freelancerId, proposal, bidAmount, deliveryTime, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    proj1.insertId,
    devId,
    'Hello! I can build this dashboard using React, Tailwind CSS, and Framer Motion for premium animations. I have a strong portfolio in dark UI designs and responsive web layouts. I can deliver this project with absolute precision.',
    1200.00,
    14,
    'Pending'
  ]);

  // Bob bids on Alice's logo project
  await dbPool.query(`
    INSERT INTO bids (projectId, freelancerId, proposal, bidAmount, deliveryTime, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    proj2.insertId,
    freelancerId,
    'I can do standard logos, though my primary skill is coding, I have done design work for tech clients in the past.',
    300.00,
    7,
    'Pending'
  ]);

  // 4. Seed Messages
  // Alice starts chat with Bob regarding Project 1
  await dbPool.query(`
    INSERT INTO messages (senderId, receiverId, projectId, messageText)
    VALUES (?, ?, ?, ?)
  `, [clientId, freelancerId, proj1.insertId, 'Hello Bob! I saw your bid on the SaaS Dashboard project. Could you share some links to glassmorphic interfaces you have built?']);

  await dbPool.query(`
    INSERT INTO messages (senderId, receiverId, projectId, messageText)
    VALUES (?, ?, ?, ?)
  `, [freelancerId, clientId, proj1.insertId, 'Hi Alice! Sure, I will send you some links to my recent portfolio repositories. I also have screenshots in my profile. I am online and ready to discuss the details!']);

  console.log('Seeding complete. Default accounts:');
  console.log(' - Admin: admin@securefreelance.com (admin123)');
  console.log(' - Client: client@securefreelance.com (client123)');
  console.log(' - Freelancer: freelancer@securefreelance.com (freelancer123)');
  console.log(' - Developer: dev@securefreelance.com (dev123)');
}

module.exports = {
  getPool,
  initializeDatabase
};
