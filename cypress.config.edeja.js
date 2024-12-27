const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');
const https = require('https'); // Ensure https is imported

module.exports = defineConfig({
  defaultCommandTimeout: 6000,
  viewportWidth: 1920,
  viewportHeight: 1080,
  env: {
    baseUrl: 'https://supportviewpayslip.edeja.com/fe',

    username_supportViewMaster: 'e-gehaltszettelMaster',
    password_supportViewMaster: 'Test1234!',

    company: 'Aqua',

    search: 'Android',
    username_supportViewAdmin: 'aquaAdmin',
    password_supportViewAdmin: 'Test1234!',
    email_supportViewAdmin: 'aqua.admin@yopmail.com',
    baseUrl_egEbox: 'https://eboxpayslip.edeja.com/fe.e-box_t/',

    username_egEbox: 'aquaABBA000100279311',
    password_egEbox: 'Test1234!',
    enableXML: [
      { id: 'T101', name: 'BB Care' },
      { id: 'T102', name: 'Beiersdorfer' },
      { id: 'L103', name: 'ISS' },
    ],
    disableXML: [
      { id: 'T101', name: 'BB Care' },
      { id: 'T102', name: 'Beiersdorfer' },
    ],
    createAdminUser: [
      {
        firstName: 'Mustermann',
        lastName: 'Admin',
        username: 'maxmustermannAdmin',
        email: 'max-mustermann@yopmail.com',
      },
    ],
    createUserNoAddress: [
      {
        firstName: 'No Address',
        lastName: 'Manual',
        username: 'manualNoAddress',
        email: 'manual.no-address@yopmail.com',
        countryCodePhoneNum: '+43',
        netNumberPhoneNum: '64',
        subscriberNumberPhoneNum: '706360',
        prefixedTitle: 'No Address Data - Title',
      },
    ],
    createUser: [
      {
        firstName: 'Address Data',
        lastName: 'Manual',
        username: 'manualAddress',
        email: 'manual.addres-data@yopmail.com',
        countryCodePhoneNum: '+43',
        netNumberPhoneNum: '64',
        subscriberNumberPhoneNum: '707777',
        streetName: 'Test Strasse',
        streetNumber: '17',
        doorNumber: '7',
        zipCode: '8010',
        city: 'Graz',
        prefixedTitle: 'Address Data - Title',
      },
    ],
    companyData: [
      {
        companyDispayName: 'Gmbh',
        description: 'Description GmbH',
        email: 'gmbh.sw@yopmail.com',
        sapCustomerNumber: '0000000777',
        streetName: 'Maine Strasse',
        doorNumber: 'doorNumber/17',
        zipCode: '8010',
        city: 'Maresse',
        userPrefix: 'uPr',
        subcompanyPrefix: 'sPr',
        subcompanyName: 'sNm',
        prefixLength: '10',
      },
    ],
  },
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
    baseUrl: 'https://supportviewpayslip.edeja.com/fe',
  },
});
