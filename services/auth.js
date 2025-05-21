// services/auth.js
const db = require('../db');

function register(name, pin, callback) {
  db.query(
    'INSERT INTO accounts (name, pin) VALUES (?, ?)',
    [name, pin],
    (err, results) => {
      if (err) {
        console.error('Gagal membuat akun:', err.message);
      } else {
        console.log('Akun berhasil dibuat. Nomor akun anda adalah:', results.insertId);
      }
      if (callback) callback();
    }
  );
}

function login(accountId, pin, callback) {
  db.query(
    'SELECT * FROM accounts WHERE id = ? AND pin = ?',
    [accountId, pin],
    (err, results) => {
      if (err) {
        console.error('Terjadi kesalahan:', err.message);
        return callback(null);
      }
      if (results.length === 0) {
        console.log('Login gagal. Nomor akun atau PIN anda salah.');
        return callback(null);
      }
      console.log('Login berhasil. Selamat datang,', results[0].name);
      callback(results[0]);
    }
  );
}

module.exports = { register, login };
