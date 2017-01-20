const makeFfiError = require('./_error.js');
const ffi = require('ffi');
const ref = require('ref');
const Struct = require('ref-struct');
const ArrayType = require('ref-array'); 

const i32 = ref.types.int32;
const u8 = ref.types.uint8; 
const u64 = ref.types.uint64; 
const u8Pointer = ref.refType(u8);
const Void = ref.types.void;
const VoidPtr = ref.refType(Void);
const usize = ref.types.size_t;
const bool = ref.types.bool;

const FfiString = new Struct({
  ptr: u8Pointer,
  len: usize,
  cap: usize 
});

const FfiStringPointer = new ref.refType(FfiString);
const u8Array = ArrayType(u8);
const XOR_NAME = ref.refType(ArrayType(u8, 32)); // FIXME: use exported const instead
const PUBLICKEYBYTES = ref.refType(ArrayType(usize, 32)); // FIXME: use exported const instead

const ObjectHandle = u64;
const App = Struct({});
const AppPtr = ref.refType(App);


module.exports = {
  types: {
    App,
    AppPtr,
    FfiString,
    FfiStringPointer,
    ObjectHandle,
    XOR_NAME,
    PUBLICKEYBYTES,
    VoidPtr,
    i32,
    bool,
    u64,
    u8,
    u8Array,
    u8Pointer,
    Void,
    usize 
  },
  functions: {
    ffi_string_create: [Void, [u8Pointer, usize]],
    ffi_string_free: [Void, [FfiString] ]
  },
  helpers: {
    read_string(ffi_str) {
      const derf = ffi_str.deref();
      return ref.reinterpret(derf.ptr, derf.len).toString();
    },
    makeFfiString: function(str) {
        const b = new Buffer(str);
        return new FfiString({ptr: b, len: b.length, cap: b.length});
    },
    asBuffer: function(res) {
      return ref.reinterpret(res[0], res[1]);
    },
    asFFIString: function(str) {
      return [makeFfiString(str)]
    },
    Promisified: function(formatter, rTypes, after) {
      // create internal function that will be
      // invoked ontop of the direct binding
      // mixing a callback into the arguments
      // and returning a promise
      return (lib, fn) => (function() {
        // the internal function that wraps the
        // actual function call

        // if there is a formatter, we are reformatting
        // the incoming arguments first
        const args = formatter ? formatter.apply(formatter, arguments): Array.prototype.slice.call(arguments);
        let types = ['pointer', i32]; // user_context, error
        if (Array.isArray(rTypes)) {
          types = types.concat(rTypes);
        } else if (rTypes) {
          types.push(rTypes);
        }
        return new Promise((resolve, reject) => {
          args.push(ref.NULL);
          args.push(ffi.Callback("void", types,
            function(uctx, err) {
              console.log("received", arguments);
              if(err !== 0) return reject(makeFfiError(err));
              // only one item or more?
              let res = types.length === 3 ? arguments[2] : Array.prototype.slice.call(arguments, 2);
              resolve(res);
            }));
          console.log("calling", args);
          fn.apply(fn, args);
        });
      });
    }
  }
};
