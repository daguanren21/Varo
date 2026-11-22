// Core 0.15 uses this ES2022 intrinsic on native engines that may not provide it.
if (typeof Object.hasOwn !== 'function') {
  Object.defineProperty(Object, 'hasOwn', {
    configurable: true,
    writable: true,
    value(object, key) {
      if (object == null) { throw new TypeError('Object.hasOwn requires a non-null object') }
      // eslint-disable-next-line e18e/prefer-object-has-own -- This defines the missing intrinsic itself.
      return Object.prototype.hasOwnProperty.call(object, key)
    },
  })
}
