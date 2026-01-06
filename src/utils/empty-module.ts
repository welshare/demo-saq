// Stub module used as a fallback for Node.js built-in modules and pino in browser builds
// This prevents errors when packages try to import Node.js-specific modules in the browser
// Based on: https://docs.nillion.com/build/private-storage/platform-react

// Pino logger stub - provides all the exports that pino consumers expect
// const createPinoStub = () => ({
//   info: () => {},
//   error: () => {},
//   warn: () => {},
//   debug: () => {},
//   trace: () => {},
//   fatal: () => {},
//   child: () => createPinoStub(),
//   level: 'info',
//   levels: { 
//     values: {
//       trace: 10,
//       debug: 20,
//       info: 30,
//       warn: 40,
//       error: 50,
//       fatal: 60,
//     },
//     labels: {
//       10: 'trace',
//       20: 'debug',
//       30: 'info',
//       40: 'warn',
//       50: 'error',
//       60: 'fatal',
//     },
//   },
// });

// // Default export for pino (function that creates a logger)
// const pino = () => createPinoStub();

// // Named export for pino
// export { pino };

// // Named export for levels (used by @walletconnect/logger)
// export const levels = {
//   values: {
//     trace: 10,
//     debug: 20,
//     info: 30,
//     warn: 40,
//     error: 50,
//     fatal: 60,
//   },
//   labels: {
//     10: 'trace',
//     20: 'debug',
//     30: 'info',
//     40: 'warn',
//     50: 'error',
//     60: 'fatal',
//   },
// };

// // Default export
// export default pino;

// // Export for pino-pretty compatibility
// export const prettyFactory = () => () => {};

export default {};