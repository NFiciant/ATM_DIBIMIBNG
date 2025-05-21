// services/transaction.js
const db = require('../db');

function checkBalance(user, callback) {
  db.query(
    'SELECT balance FROM accounts WHERE id = ?',
    [user.id],
    (err, results) => {
      if (err) {
        console.error('Gagal menarik\saldo:', err.message);
      } else {
        console.log('Saldo Anda saat ini adalah: Rp', results[0].balance);
      }
      if (callback) callback();
    }
  );
}

function deposit(user, amount, callback) {
  if (amount <= 0) {
    console.log('Jumlah saldo yang di deposit harus lebih dari 0.');
    return callback();
  }

  db.query(
    'UPDATE accounts SET balance = balance + ? WHERE id = ?',
    [amount, user.id],
    (err) => {
      if (err) {
        console.error('Gagal deposit:', err.message);
      } else {
        db.query(
          'INSERT INTO transactions (account_id, type, amount) VALUES (?, "deposit", ?)',
          [user.id, amount]
        );
        console.log('Deposit berhasil sebesar Rp', amount);
      }
      callback();
    }
  );
}

function withdraw(user, amount, callback) {
  if (amount <= 0) {
    console.log('Jumlah penarikan harus lebih dari 0.');
    return callback();
  }

  db.query(
    'SELECT balance FROM accounts WHERE id = ?',
    [user.id],
    (err, results) => {
      if (err) {
        console.error('Gagal mengambil saldo:', err.message);
        return callback();
      }
      if (results[0].balance < amount) {
        console.log('Saldo anda tidak cukup untuk melakukan penarikan!');
        return callback();
      }

      db.query(
        'UPDATE accounts SET balance = balance - ? WHERE id = ?',
        [amount, user.id],
        (err2) => {
          if (err2) {
            console.error('Gagal menarik saldo:', err2.message);
          } else {
            db.query(
              'INSERT INTO transactions (account_id, type, amount) VALUES (?, "withdraw", ?)',
              [user.id, amount]
            );
            console.log('Penarikan saldo berhasil sebesar Rp', amount);
          }
          callback();
        }
      );
    }
  );
}

function transfer(user, targetId, amount, callback) {
  if (amount <= 0) {
    console.log('Jumlah saldo yang di transfer harus lebih dari 0.');
    return callback();
  }

  db.query(
    'SELECT balance FROM accounts WHERE id = ?',
    [user.id],
    (err, results) => {
      if (err) {
        console.error('Gagal membaca saldo:', err.message);
        return callback();
      }
      if (results[0].balance < amount) {
        console.log('Saldo anda tidak mencukupi untuk transfer.');
        return callback();
      }

      db.query(
        'SELECT * FROM accounts WHERE id = ?',
        [targetId],
        (err2, targetResults) => {
          if (err2) {
            console.error('Gagal memeriksa akun tujuan:', err2.message);
            return callback();
          }
          if (targetResults.length === 0) {
            console.log('Akun tujuan transfer tidak ditemukan.');
            return callback();
          }

          // Transfer out
          db.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, user.id]);
          // Transfer in
          db.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, targetId]);

          // Simpan histori transaksi
          db.query(
            'INSERT INTO transactions (account_id, type, amount, target_id) VALUES (?, "transfer_out", ?, ?)',
            [user.id, amount, targetId]
          );
          db.query(
            'INSERT INTO transactions (account_id, type, amount, target_id) VALUES (?, "transfer_in", ?, ?)',
            [targetId, amount, user.id]
          );

          console.log(`Transfer sebesar Rp${amount} ke akun ${targetId} berhasil.`);
          callback();
        }
      );
    }
  );
}

module.exports = { checkBalance, deposit, withdraw, transfer };
