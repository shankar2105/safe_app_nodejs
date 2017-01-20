const helpers = require('../helpers');
const lib = require('../native/lib');

class Container extends helpers.NetworkObject {
  getAddressInfo() {
    return lib.mdata_info_extract_name_and_type_tag(this.app.connection, this.ref);
  }
  static _clean(app, ref) {
    // FIXME: doesn't exist in FFI/rust at the moment
    lib.mdata_info_free(app.connection, ref);
  }
  encrypt_entry_key(info) {
    return lib.mdata_info_encrypt_entry_key(this.app.connection, this.ref, info.ptr, info.len)
      .then(i => new Container(this.app, i));
  }

  encrypt_entry_value(info) {
    return lib.mdata_info_encrypt_entry_value(this.app.connection, this.ref, info.ptr, info.len)
      .then(i => new Container(this.app, i));
  }

  serialise() {
    return lib.mdata_info_serialise(this.app.connection, this.ref)
      .then(i => new Container(this.app, i));
  }

  deserialise(info) {
    return lib.mdata_info_deserialise(this.app.connection, info.ptr, info.len)
      .then(i => new Container(this.app, i));
  }
}

class ContainerAccess {
  constructor(app) {
    this.app = app;
  }
  wrapContainerInfo(info) {
    return Container(this.app, info);
  }

  new_public(name, typeTag) {
    return lib.mdata_info_new_public(this.app.connection, name, typeTag).then(info => new Container(this.app, info));
  }

  new_private(name, typeTag) {
    return lib.mdata_info_new_private(this.app.connection, name, typeTag).then(info => new Container(this.app, info));
  }

  random_public(typetag) {
    return lib.mdata_info_random_public(this.app.connection, typeTag).then(info => new Container(this.app, info));
  }

  random_private(typetag) {
    return lib.mdata_info_random_private(this.app.connection, typeTag).then(info => new Container(this.app, info));
  }
}

module.exports = ContainerAccess;
