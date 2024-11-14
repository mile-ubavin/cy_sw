// const { defineConfig } = require("cypress");

// module.exports = defineConfig({
//   e2e: {
//     setupNodeEvents(on, config) {
//       // implement node event listeners here
//     },
//   },
// });

// //OK
// const { defineConfig } = require('cypress');

// module.exports = defineConfig({
//   defaultCommandTimeout: 6000,
//   viewportWidth: 1920,
//   viewportHeight: 1080,
//   e2e: {
//     setupNodeEvents(on, config) {
//       // implement node event listeners here
//     },
//     specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx,feature}',
//     chromeWebSecurity: false,
//     headless: true,
//     modifyObstructiveCode: false,
//     // experimentalSessionAndOrigin: true,
//     // experimentalSessionSupport: true,
//     baseUrl: 'https://www.e-brief.at/fe_t',
//   },
// });

//NEW 2024 - extended with download file option
// const { defineConfig } = require('cypress');
// const fs = require('fs');
// const path = require('path');
// const https = require('https');

// module.exports = defineConfig({
//   defaultCommandTimeout: 6000,
//   viewportWidth: 1920,
//   viewportHeight: 1080,
//   e2e: {
//     setupNodeEvents(on, config) {
//       on('task', {
//         downloadFile({ url, destinationPath }) {
//           return new Promise((resolve, reject) => {
//             const file = fs.createWriteStream(destinationPath);
//             https
//               .get(url, (response) => {
//                 if (response.statusCode !== 200) {
//                   reject(
//                     new Error(`Failed to get '${url}' (${response.statusCode})`)
//                   );
//                   return;
//                 }
//                 response.pipe(file);
//                 file.on('finish', () => {
//                   file.close(resolve); // Close the file and resolve the promise
//                 });
//               })
//               .on('error', (err) => {
//                 fs.unlink(destinationPath); // Delete the file if error occurs
//                 reject(err);
//               });
//           });
//         },
//       });
//     },
//     specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx,feature}',
//     chromeWebSecurity: false,
//     headless: true,
//     baseUrl: 'https://www.e-brief.at/fe_t',
//   },
// });
const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');
const https = require('https'); // Ensure https is imported

module.exports = defineConfig({
  defaultCommandTimeout: 6000,
  viewportWidth: 1920,
  viewportHeight: 1080,
  e2e: {
    setupNodeEvents(on, config) {
      // Register the downloadFile task
      on('task', {
        downloadFile({ url, destinationPath }) {
          return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(destinationPath);
            https
              .get(url, (response) => {
                if (response.statusCode !== 200) {
                  reject(
                    new Error(`Failed to get '${url}' (${response.statusCode})`)
                  );
                  return;
                }
                response.pipe(file);
                file.on('finish', () => {
                  file.close(resolve);
                });
              })
              .on('error', (err) => {
                fs.unlink(destinationPath, (unlinkErr) => {
                  if (unlinkErr) {
                    console.error(`Failed to delete file: ${unlinkErr}`);
                  }
                });
                reject(err);
              });
          });
        },

        // Register the getDownloadedPdf task
        getDownloadedPdf(downloadsDir) {
          try {
            const files = fs.readdirSync(downloadsDir);
            const pdfFiles = files
              .filter((file) => file.endsWith('.pdf'))
              .map((file) => {
                const fullPath = path.join(downloadsDir, file);
                const fileStats = fs.statSync(fullPath);
                return { file, fullPath, time: fileStats.mtime };
              });
            pdfFiles.sort((a, b) => b.time - a.time);
            return pdfFiles.length > 0 ? pdfFiles[0].fullPath : null;
          } catch (err) {
            console.error(`Error reading directory: ${err}`);
            return null;
          }
        },

        // Register the openFile task
        openFile(filePath) {
          const open = require('open'); // Use require for consistency
          return open(filePath).catch((err) => {
            console.error(`Failed to open file: ${err}`);
            throw err; // Propagate the error
          });
        },
      });
    },
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}', // Ensure this matches your structure
    chromeWebSecurity: false,
    headless: false, // Turn off headless mode for debugging
    baseUrl: 'https://www.e-brief.at/fe_t',
    //baseUrl: 'https://www.e-brief.at/fe',
  },
});
