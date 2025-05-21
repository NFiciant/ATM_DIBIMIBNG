const { program } = require('commander');
const readline = require('readline-sync');
const { register, login } = require('./services/auth');
const {
  checkBalance,
  deposit,
  withdraw,
  transfer
} = require('./services/transaksi');

let currentUser = null;

//Loop menu
function showMainMenu() {
  console.log('\n=== Selamat datang di ATM Dibimbing ===');
  console.log('List menu:');
  console.log('1. Register');
  console.log('2. Login');
  console.log('3. Check Balance');
  console.log('4. Deposit');
  console.log('5. Withdraw');
  console.log('6. Transfer');
  console.log('7. Keluar');

  const choice = readline.questionInt('\nSilahkan pilih menu (1-7): ');

  switch (choice) {
    case 1:
      const name = readline.question('Masukkan nama anda: ');
      const pin = readline.question('Masukkan PIN anda: ', { hideEchoBack: true });
      register(name, pin, () => showMainMenu());
      break;

    case 2:
      const id = readline.questionInt('Masukkan nomor akun yang sudah terdaftar: ');
      const pinLogin = readline.question('Masukkan PIN anda: ', { hideEchoBack: true });
      login(id, pinLogin, (user) => {
        if (user) currentUser = user;
        showMainMenu();
      });
      break;

    case 3:
      if (!currentUser) {
        console.log('Silakan lakukan login terlebih dahulu!');
        return showMainMenu();
      }
      checkBalance(currentUser, () => showMainMenu());
      break;

    case 4:
      if (!currentUser) {
        console.log('Silakan lakukan login terlebih dahulu!');
        return showMainMenu();
      }
      const dep = readline.questionFloat('Masukkan jumlah saldo yang ingin di deposit: ');
      deposit(currentUser, dep, () => showMainMenu());
      break;

    case 5:
      if (!currentUser) {
        console.log('Silakan lakukan login terlebih dahulu!');
        return showMainMenu();
      }
      const wd = readline.questionFloat('Masukkan jumlah saldo yang ingin ditarik: ');
      withdraw(currentUser, wd, () => showMainMenu());
      break;

    case 6:
      if (!currentUser) {
        console.log('Silakan lakukan login terlebih dahulu!');
        return showMainMenu();
      }
      const targetId = readline.questionInt('Masukkan nomor akun tujuan: ');
      const amount = readline.questionFloat('Masukkan jumlah saldo yang ingin di transfer: ');
      transfer(currentUser, targetId, amount, () => showMainMenu());
      break;

    case 7:
      console.log('Sesi selesai');
      process.exit();

    default:
      console.log('Pilihan salah.');
      showMainMenu();
  }
}

program.action(() => {
  showMainMenu();
});

program.parse(process.argv);
