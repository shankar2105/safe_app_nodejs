const ffi = require('ffi');
const ref = require("ref");
const Struct = require('ref-struct');
const base = require('./_base');
const MDataInfoHandle = require('./_mutable').types.MDataInfoHandle;
const t = base.types;
const h = base.helpers;

const File = Struct({
  size: t.u64,
  created_sec: t.i64,
  created_nsec: t.u32,
  modified_sec: t.i64,
  modified_nsec: t.u32,
  user_metadata_ptr: t.u8Pointer,
  user_metadata_len: t.usize,
  user_metadata_cap: t.usize,
  data_map_name: t.XOR_NAME
});

const FilePtr = ref.refType(File);

module.exports = {
  types: {
    File,
    FilePtr
  },
  functions: {
    file_fetch: [t.Void, [t.AppPtr, MDataInfoHandle, 'string', 'pointer', 'pointer']],
    file_insert: [t.Void, [t.AppPtr, MDataInfoHandle, 'string', FilePtr, 'pointer', 'pointer']],
    file_update: [t.Void, [t.AppPtr, MDataInfoHandle, 'string', FilePtr, t.u64, 'pointer', 'pointer']]
  },
  api: {
    file_fetch: h.Promisified(null, [FilePtr, t.u64], (res) => {
      const file = res[0].deref();
      const data_map_name = file.data_map_name;
      const size = file.size;
      const created_sec = file.created_sec;
      const created_nsec = file.created_nsec;
      const modified_sec = file.modified_sec;
      const modified_nsec = file.modified_nsec;

      let metadata = file.user_metadata_len > 0
        ? ref.reinterpret(file.user_metadata_ptr, file.user_metadata_len) : null;

      if (metadata) {
        // we try to understand it as JSON
        try {
          metadata = JSON.parse(metadata);
        } catch (e) {
          // we can safely ignore this
          if (console && console.warn) {
            console.warn(`Parsing user metadata '${metadata}' of '${data_map_name}' failed: ${e}`)
          }
        }
      }
      return {metadata,
              data_map_name,
              size,
              created_sec,
              created_nsec,
              modified_sec,
              modified_nsec,
              version: res[1]}
    }),
    file_insert: h.Promisified(null, []),
    file_update: h.Promisified(null, [])
  }
}
