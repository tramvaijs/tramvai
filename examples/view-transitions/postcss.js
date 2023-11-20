module.exports = {
  plugins: [
    require('postcss-modules-values-replace'),
    require('postcss-custom-properties')({
      preserve: false,
    }),
    require('postcss-custom-media')({
      preserve: false,
    }),
    require('tailwindcss'),
    require('tailwindcss/nesting'),
  ],
};
