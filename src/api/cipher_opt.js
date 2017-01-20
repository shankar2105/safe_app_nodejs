const helpers = require('../helpers');
const lib = require('../native/lib');

class CipherOpt extends helpers.NetworkObject {
  static _clean(app, ref) {
    // FIXME: doesn't exist in FFI/rust at the moment
    lib.cipher_opt_free(app.connection, ref);
  }
}

class CipherOptProvider {
  constructor(app) {
    this.app = app;
  }
  new_plain() {
    return lib.cipher_opt_new_plaintext(this.app.connection).then(c => new CipherOpt(this.app, c));
  }
  new_symmetric() {
    return lib.cipher_opt_new_symmetric(this.app.connection).then(c => new CipherOpt(this.app, c));
  }
  new_asymmetric(encryptKeyHandle) {
    return lib.cipher_opt_new_symmetric(this.app.connection, encryptKeyHandle).then(c => new CipherOpt(this.app, c));
  }
}

module.exports = CipherOptProvider;
