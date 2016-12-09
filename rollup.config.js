export default {
  entry: 'index.es',
  targets: [
    {
      format: 'cjs',
      dest: 'index.js',
      interop: false
    }
  ]
};
