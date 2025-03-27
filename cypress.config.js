const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');
const https = require('https');
const storedValues = {};

// Task: Get the latest downloaded PDF file
const getDownloadedPdf = (downloadsDir) => {
  try {
    console.log(`Searching for PDFs in: ${downloadsDir}`);
    const files = fs.readdirSync(downloadsDir);
    const pdfFiles = files
      .filter((file) => file.endsWith('.pdf'))
      .map((file) => {
        const fullPath = path.join(downloadsDir, file);
        const fileStats = fs.statSync(fullPath);
        return { file, fullPath, time: fileStats.mtime };
      });

    pdfFiles.sort((a, b) => b.time - a.time);

    if (pdfFiles.length > 0) {
      console.log(`Found PDF: ${pdfFiles[0].fullPath}`);
    } else {
      console.log('No PDF files found');
    }

    return pdfFiles.length > 0 ? pdfFiles[0].fullPath : null;
  } catch (err) {
    console.error(`Error reading directory: ${err.message}`);
    return null;
  }
};

// Task: Download a file from a URL
const downloadFileToFolder = ({ url, fileName }) => {
  // Define the target downloads folder
  const downloadsFolder =
    'C:\\Users\\mubavin\\Cypress\\EG\\cypress-automatison-framework\\cypress\\downloads';
  const destinationPath = path.join(downloadsFolder, fileName);

  return new Promise((resolve, reject) => {
    // Create a writable stream to the destination file
    const file = fs.createWriteStream(destinationPath);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          return reject(
            new Error(
              `Failed to download file: ${url} returned status code ${response.statusCode}`
            )
          );
        }

        // Pipe the response data into the file
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            console.log(`File downloaded to ${destinationPath}`);
            resolve(destinationPath);
          });
        });
      })
      .on('error', (err) => {
        // Delete the file on error to avoid partial files
        fs.unlink(destinationPath, (unlinkErr) => {
          if (unlinkErr) console.error(`Error deleting file: ${unlinkErr}`);
        });
        reject(err);
      });
  });
};

// Task: Open a file using dynamic import
const openFile = async (filePath) => {
  const { default: open } = await import('open'); // Dynamic import
  return open(filePath).catch((err) => {
    console.error(`Failed to open file: ${err.message}`);
    throw err;
  });
};
const environments = {
  eg_dev: {
    usernameFromEmailBody: '',
    passwordFromEmailBody: '',
    baseUrl: 'https://supportviewpayslip.edeja.com/fe',

    username_supportViewMaster: 'e-gehaltszettelMaster',
    password_supportViewMaster: 'Test1234!',

    company: 'Aqua',
    companyPrefix: 'aqua',
    companyEmail: 'aqua.gmbh@yopmail.com',

    search: 'Android',
    username_supportViewAdmin: 'aquaAdmin',
    password_supportViewAdmin: 'Test1234!',
    email_supportViewAdmin: 'aqua.admin@yopmail.com',
    baseUrl_egEbox: 'https://eboxpayslip.edeja.com/fe.e-box_t/',
    username_egEbox: 'aquaABBA000100279311',
    password_egEbox: 'Test1234!',
    accountNumber_egEbox: 'ABBA000100279311',
    tagesBaseUrl: 'https://tages-post.edeja.com/',
    downloadsFolder:
      'C:/Users/mubavin/Cypress/EG/cypress-automatison-framework/cypress/downloads/',
    dashboardURL: 'https://supportviewpayslip.edeja.com/fe/dashboard/groups',
    eboxDeliveryPage: 'https://eboxpayslip.edeja.com/fe.e-box_t/deliveries',
    enableXML: [
      { id: 'T101', name: 'BB Care' },
      { id: 'T102', name: 'Beiersdorfer' },
      { id: 'L103', name: 'ISS' },
    ],
    disableXML: [
      { id: 'T101', name: 'BB Care' },
      { id: 'T102', name: 'Beiersdorfer' },
    ],
    enablePDFDictionary: [
      { name: 'PDFTABDictionary-200' },
      { name: 'PDFTABDictionary-301' },
      { name: 'PDFTABDictionary-305' },
    ],
    disablePDFDictionary: [
      { name: 'PDFTABDictionary-200' },
      { name: 'PDFTABDictionary-301' },
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
        // Explicitly set address fields to empty strings
        streetName: '',
        streetNumber: '',
        doorNumber: '',
        zipCode: '',
        city: '',
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
    csvTestuser: [
      {
        accountNumber: 'ottoTestuser',
        email: 'otto.testuser@yopmail.com',
      },
    ],
  },
  eg_test: {
    baseUrl:
      'https://e-gehaltszettel-t.post-business-solutions.at/fe.e-gehaltszettel_t',

    username_supportViewMaster: 'e-gehaltszettelMaster',
    password_supportViewMaster: 'Test1234!',

    company: 'Aqua',
    companyPrefix: 'aqua',
    companyEmail: 'aqua.gmbh@yopmail.com',

    search: 'Android',
    username_supportViewAdmin: 'aquaAdmin',
    password_supportViewAdmin: 'Test1234!',
    email_supportViewAdmin: 'aqua.admin@yopmail.com',
    baseUrl_egEbox:
      'https://e-gehaltszettel-t.post-business-solutions.at/fe.e-box_t/',
    companyPrefix: 'aqua',
    username_egEbox: 'aquaABBA000100279311',
    password_egEbox: 'Test1234!',
    accountNumber_egEbox: 'ABBA000100279311',
    tagesBaseUrl: 'https://abn-www.einfach-brief.at/fe_t/',
    downloadsFolder:
      'C:/Users/mubavin/Cypress/EG/cypress-automatison-framework/cypress/downloads/',
    dashboardURL:
      'https://e-gehaltszettel-t.post-business-solutions.at/fe.e-gehaltszettel_t/dashboard/groups',
    eboxDeliveryPage:
      'https://e-gehaltszettel-t.post-business-solutions.at/fe.e-gehaltszettel_t/deliveries',
    enableXML: [
      { id: 'T101', name: 'BB Care' },
      { id: 'T102', name: 'Beiersdorfer' },
      { id: 'L103', name: 'ISS' },
    ],
    disableXML: [
      { id: 'T101', name: 'BB Care' },
      { id: 'T102', name: 'Beiersdorfer' },
    ],
    enablePDFDictionary: [
      { name: 'PDFTABDictionary-200' },
      { name: 'PDFTABDictionary-301' },
      { name: 'PDFTABDictionary-305' },
    ],
    disablePDFDictionary: [
      { name: 'PDFTABDictionary-200' },
      { name: 'PDFTABDictionary-301' },
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
        // Explicitly set address fields to empty strings
        streetName: '',
        streetNumber: '',
        doorNumber: '',
        zipCode: '',
        city: '',
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
    csvTestuser: [
      {
        accountNumber: 'ottoTestuser',
        email: 'otto.testuser@yopmail.com',
      },
    ],
  },
  eg_prod: {
    baseUrl:
      'https://e-gehaltszettel.post-business-solutions.at/fe.e-gehaltszettel',

    username_supportViewMaster: 'e-gehaltszettelMaster',
    password_supportViewMaster: '%7axX~mc@4q>KhADF',

    company: 'Aqua',
    companyPrefix: 'aqua',
    companyEmail: 'aqua.gmbh@yopmail.com',

    search: 'Android',
    username_supportViewAdmin: 'aquaAdmin',
    password_supportViewAdmin: 'Test1234!',
    email_supportViewAdmin: 'aqua.admin@yopmail.com',
    baseUrl_egEbox:
      'https://e-gehaltszettel.post-business-solutions.at/fe.e-box/',
    companyPrefix: 'aqua',
    username_egEbox: 'aquaABBA000100279311',
    password_egEbox: 'Test1234!',
    accountNumber_egEbox: 'ABBA000100279311',
    tagesBaseUrl: 'https://www.einfach-brief.at/fe/',
    downloadsFolder:
      'C:/Users/mubavin/Cypress/EG/cypress-automatison-framework/cypress/downloads/',
    dashboardURL:
      'https://e-gehaltszettel.post-business-solutions.at/fe.e-gehaltszettel/dashboard/groups',
    eboxDeliveryPage:
      'https://e-gehaltszettel.post-business-solutions.at/fe.e-gehaltszettel/deliveries',
    enableXML: [
      { id: 'T101', name: 'BB Care' },
      { id: 'T102', name: 'Beiersdorfer' },
      { id: 'L103', name: 'ISS' },
    ],
    disableXML: [
      { id: 'T101', name: 'BB Care' },
      { id: 'T102', name: 'Beiersdorfer' },
    ],
    enablePDFDictionary: [
      { name: 'PDFTABDictionary-200' },
      { name: 'PDFTABDictionary-301' },
      { name: 'PDFTABDictionary-305' },
    ],
    disablePDFDictionary: [
      { name: 'PDFTABDictionary-200' },
      { name: 'PDFTABDictionary-301' },
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
        // Explicitly set address fields to empty strings
        streetName: '',
        streetNumber: '',
        doorNumber: '',
        zipCode: '',
        city: '',
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
    csvTestuser: [
      {
        accountNumber: 'ottoTestuser',
        email: 'otto.testuser@yopmail.com',
      },
    ],
  },
  dp_dev: {
    baseUrl: 'https://datapart.edeja.com/ebox',
    baseUrl_04: 'https://services.post-business-solutions.at/pf.datapart_t/',
    baseUrl_prod: 'https://my-datapart.de/pf.datapart',
    dp_sw_dev: 'http://supportview.edeja.com/login',
    dp_sw_04:
      'https://services.post-business-solutions.at/pf.datapart_t_supportView/login',
    dp_master: 'datapartMaster',
    username_supportViewAdmin_04: 'tsupporter',
    password_supportViewAdmin_04: 'Test1234!',
    username_student: 'smile1',
    password_student: 'Test1234!',
    username_supportViewMaster: 'e-gehaltszettelMaster',
    password_supportViewMaster: 'Test1234!',
    company: 'Aqua',
    username_supportViewAdmin: 'aquaAdmin',
    password_supportViewAdmin: 'Test1234!',
    username_supportViewAdmin_04: 'tsupporter',
    password_supportViewAdmin_04: 'Test1234!',
    accountOwner: 'Test Account',
    street: 'Test Street',
    houseNr: '17',
    postalCode: '8010',
    city: 'Graz',
    iban: 'DE26603900000059633000',
    bic: 'GENODES1BBV',
    city2: 'Belgrade',
    email: 'datapart.test@yopmail.com',
    phone: '+381642826462',
    footerTitle: [
      'Unternehmen',
      'Kontakt',
      'Datenschutzhinweis',
      'Compliance',
      'Impressum',
      'Nutzungsbedingungen',
    ],
    footerTitle_en: [
      'Company',
      'Kontakt',
      'Privacy Notice',
      'Compliance',
      'Impressum',
      'Terms of Use',
    ],
    footerLinks: [
      'ueber-uns/',
      'kontakt-fahrschueler/',
      'Datenschutzhinweis/',
      'compliance/',
      'impressum/',
      'nutzungsbedingungen/',
    ],
  },
  dp_test: {
    baseUrl: 'https://services.post-business-solutions.at/pf.datapart_t/',
    baseUrl_04: 'https://services.post-business-solutions.at/pf.datapart_t/',
    baseUrl_prod: 'https://my-datapart.de/pf.datapart',
    dp_sw_dev: 'http://supportview.edeja.com/login',
    dp_sw_04:
      'https://services.post-business-solutions.at/pf.datapart_t_supportView/login',
    dp_master: 'datapartMaster',
    username_supportViewAdmin: 'tsupporter',
    password_supportViewAdmin: 'Test1234!',
    username_student: 'smile1•',
    password_student: 'Test1234!',
    username_supportViewMaster: 'e-gehaltszettelMaster',
    password_supportViewMaster: 'Test1234!',
    company: 'Aqua',
    username_supportViewAdmin: 'aquaAdmin',
    password_supportViewAdmin: 'Test1234!',

    accountOwner: 'Test Account',
    street: 'Test Street',
    houseNr: '17',
    postalCode: '8010',
    city: 'Graz',
    iban: 'DE26603900000059633000',
    bic: 'GENODES1BBV',
    city2: 'Belgrade',
    email: 'datapart.test@yopmail.com',
    phone: '+381642826462',
    footerTitle: [
      'Unternehmen',
      'Kontakt',
      'Datenschutzhinweis',
      'Compliance',
      'Impressum',
      'Nutzungsbedingungen',
    ],
    footerTitle_en: [
      'Company',
      'Kontakt',
      'Privacy Notice',
      'Compliance',
      'Impressum',
      'Terms of Use',
    ],
    footerLinks: [
      'ueber-uns/',
      'kontakt-fahrschueler/',
      'Datenschutzhinweis/',
      'compliance/',
      'impressum/',
      'nutzungsbedingungen/',
    ],
  },
  dp_prod: {
    baseUrl: 'https://my-datapart.de/pf.datapart',
    baseUrl_04: 'https://services.post-business-solutions.at/pf.datapart_t/',
    baseUrl_prod: 'https://my-datapart.de/pf.datapart',
    dp_sw_dev: 'http://supportview.edeja.com/login',
    dp_sw_04:
      'https://services.post-business-solutions.at/pf.datapart_t_supportView/login',
    dp_master: 'datapartMaster',
    username_supportViewAdmin: 'tsupporter',
    password_supportViewAdmin: 'Test1234!',
    username_student: 'smile',
    password_student: 'Test1234!',
    username_supportViewMaster: 'e-gehaltszettelMaster',
    password_supportViewMaster: 'Test1234!',
    company: 'Aqua',
    username_supportViewAdmin: 'aquaAdmin',
    password_supportViewAdmin: 'Test1234!',

    accountOwner: 'Test Account',
    street: 'Test Street',
    houseNr: '17',
    postalCode: '8010',
    city: 'Graz',
    iban: 'DE26603900000059633000',
    bic: 'GENODES1BBV',
    city2: 'Belgrade',
    email: 'datapart.test@yopmail.com',
    phone: '+381642826462',
    footerTitle: [
      'Unternehmen',
      'Kontakt',
      'Datenschutzhinweis',
      'Compliance',
      'Impressum',
      'Nutzungsbedingungen',
    ],
    footerTitle_en: [
      'Company',
      'Kontakt',
      'Privacy Notice',
      'Compliance',
      'Impressum',
      'Terms of Use',
    ],
    footerLinks: [
      'ueber-uns/',
      'kontakt-fahrschueler/',
      'Datenschutzhinweis/',
      'compliance/',
      'impressum/',
      'nutzungsbedingungen/',
    ],
  },
};

const credentials = {}; // Temporary global storage for credentials
module.exports = defineConfig({
  defaultCommandTimeout: 6000,
  viewportWidth: 1920,
  viewportHeight: 1080,

  e2e: {
    setupNodeEvents(on, config) {
      // Register the downloadFile task
      on('task', {
        getDownloadedPdf,
        downloadFileToFolder,
        openFile,
        setValue({ key, value }) {
          storedValues[key] = value;
          return null; // Cypress requires tasks to return a value, even if it's null
        },
        getValue(key) {
          return storedValues[key] || null;
        },
        setCredentials({ extractedUsername, extractedPassword }) {
          credentials.extractedUsername = extractedUsername;
          credentials.extractedPassword = extractedPassword;
          return null;
        },
        getCredentials() {
          return credentials;
        },
      });
      //  Set executing tests on various environments, targeting appropriate json from const=environments
      const envConfig = environments['eg_test'];
      return { ...config, env: { ...config.env, ...envConfig } };
    }, //end
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}', // Ensure this matches your structure
    chromeWebSecurity: false,
    headless: false, // Turn off headless mode for debugging
    baseUrl: 'https://www.e-brief.at/fe_t',
  },
});

// const credentials = {}; // Global storage for credentials

// module.exports = defineConfig({
//   defaultCommandTimeout: 6000,
//   viewportWidth: 1920,
//   viewportHeight: 1080,

//   e2e: {
//     setupNodeEvents(on, config) {
//       on('task', {
//         setCredentials({ username, password }) {
//           credentials.username = username;
//           credentials.password = password;
//           console.log(' Credentials stored:', credentials);
//           return null;
//         },
//         getCredentials() {
//           if (credentials.username && credentials.password) {
//             console.log(' Returning stored credentials:', credentials);
//             return credentials;
//           } else {
//             console.error('No stored credentials found!');
//             return null;
//           }
//         },
//       });

//       return config;

//       const envConfig = environments['eg_dev'];
//       return { ...config, env: { ...config.env, ...envConfig } };
//     },
//     specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
//     chromeWebSecurity: false,
//     headless: false,
//     baseUrl: 'https://www.e-brief.at/fe_t',
//   },
// });
