const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'lab_booking_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

const connectDB = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(190) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await connection.query(`
      ALTER TABLE users
      MODIFY role VARCHAR(20) NOT NULL DEFAULT 'student'
    `);
    await connection.query(`
      UPDATE users
      SET role = 'student'
      WHERE LOWER(TRIM(role)) IN ('', 'user')
         OR LOWER(TRIM(role)) NOT IN ('admin', 'staff', 'student')
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS labs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        capacity INT NOT NULL DEFAULT 1,
        equipment TEXT,
        description TEXT,
        is_available TINYINT(1) NOT NULL DEFAULT 1,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const [labColumns] = await connection.query(
      'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
      [process.env.MYSQL_DATABASE || 'lab_booking_db', 'labs']
    );
    const labColumnNames = new Set(labColumns.map((column) => column.COLUMN_NAME));
    if (!labColumnNames.has('description')) await connection.query('ALTER TABLE labs ADD COLUMN description TEXT');
    if (!labColumnNames.has('is_available')) await connection.query('ALTER TABLE labs ADD COLUMN is_available TINYINT(1) NOT NULL DEFAULT 1');
    if (!labColumnNames.has('image_url')) await connection.query('ALTER TABLE labs ADD COLUMN image_url VARCHAR(255)');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        equipment_condition VARCHAR(30) NOT NULL DEFAULT 'good',
        availability VARCHAR(30) NOT NULL DEFAULT 'available',
        image_url VARCHAR(255),
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_equipment_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        equipment_id INT NOT NULL,
        user_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        notes TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        reviewed_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_reservation_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
        CONSTRAINT fk_reservation_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_reservation_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lab_id INT NOT NULL,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        reason TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_booking_lab FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE CASCADE,
        CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('MySQL connected and schema ready');
  } finally {
    connection.release();
  }
};

module.exports = { pool, connectDB };