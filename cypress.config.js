// const { defineConfig } = require('cypress');
// const fs = require('fs');
// const path = require('path');
// const https = require('https');
// const storedValues = {};

// Top-level Node imports
const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');
const https = require('https');
const Seven = require('node-7z');
const sevenBin = require('7zip-bin');
const StreamZip = require('node-stream-zip');
//const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js'); // Legacy import
const pdfParse = require('pdf-parse');
const axios = require('axios');
const Papa = require('papaparse');

//New 2025

async function downloadZipAndReadFirstPdf() {
  const downloadUrl = 'https://www.yopmail.com/path-to-your-zip.zip'; // Replace with actual URL

  // Download the ZIP
  const zipName = 'downloaded.zip';
  const zipPath = path.join(__dirname, zipName);
  const response = await axios.get(downloadUrl, {
    responseType: 'arraybuffer',
  });
  fs.writeFileSync(zipPath, response.data);

  console.log('Downloaded ZIP------------------------>>>:', zipName);

  // Extract ZIP
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();

  const pdfEntry = zipEntries.find((e) =>
    e.entryName.toLowerCase().endsWith('.pdf')
  );
  if (!pdfEntry) throw new Error('No PDF file found in ZIP');

  console.log('Found PDF in ZIP:', pdfEntry.entryName);

  // Extract PDF content
  const pdfBuffer = pdfEntry.getData();
  const pdfData = await pdfParse(pdfBuffer);
  console.log('PDF Text Preview:', pdfData.text.slice(0, 500)); // Log first 500 chars

  return true;
}

const storedValues = {};

// Define custom ZIP extractor task (✓ correct location)
function extractPasswordProtectedZip({ zipFilePath, password, outputDir }) {
  return new Promise((resolve) => {
    try {
      const fs = require('fs');
      const Seven = require('node-7z');
      const sevenBin = require('7zip-bin');

      cy.log(
        '------------------------------------------------>>>',
        zipFilePath
      );

      if (!fs.existsSync(zipFilePath)) {
        return resolve({ success: false, error: 'ZIP file not found' });
      }

      fs.mkdirSync(outputDir, { recursive: true });

      // Build options dynamically
      const options = {
        $bin: sevenBin.path7za,
        overwrite: 'a', // always overwrite
      };

      if (password && password.trim() !== '') {
        options.p = password;
      }

      const extractor = Seven.extractFull(zipFilePath, outputDir, options);
      let errorOccurred = false;

      extractor.on('data', (entry) => {
        console.log(`Extracted: ${entry.file}`);
      });

      extractor.on('end', () => {
        if (errorOccurred) return;
        const files = fs.readdirSync(outputDir);
        const pdfCount = files.filter((f) => f.endsWith('.pdf')).length;
        resolve({ success: true, pdfCount });
      });

      extractor.on('error', (err) => {
        errorOccurred = true;
        resolve({ success: false, error: err.message });
      });
    } catch (err) {
      resolve({ success: false, error: err.message });
    }
  });
}

// Reusable task: Get newest ZIP
function getDownloadedZIP(downloadsDir) {
  const files = fs.readdirSync(downloadsDir);

  const zipFiles = files
    .filter((f) => f.endsWith('.zip'))
    .map((f) => {
      const fullPath = path.join(downloadsDir, f);
      return { fullPath, time: fs.statSync(fullPath).mtime };
    })
    .sort((a, b) => b.time - a.time);

  return zipFiles.length > 0 ? zipFiles[0].fullPath : null;
}

// Reusable task: Open password-protected PDF (direct, not from ZIP)
function openPasswordProtectedPdf({ pdfPath, password }) {
  return new Promise(async (resolve) => {
    try {
      const data = new Uint8Array(fs.readFileSync(pdfPath));
      const loadingTask = pdfjsLib.getDocument({ data, password });
      const pdfDoc = await loadingTask.promise;
      resolve({ success: true, numPages: pdfDoc.numPages });
    } catch (err) {
      resolve({ success: false, error: err.message });
    }
  });
}

// function const openFile = async (filePath) => {
//   const { default: open } = await import('open'); // Dynamic import
//   return open(filePath).catch((err) => {
//     console.error(`Failed to open file: ${err.message}`);
//     throw err;
//   });
// };

//--------------------------------------->>>

// function getDownloadedZIP(downloadsDir) {
//   // Read all file names in the downloads directory
//   const files = fs.readdirSync(downloadsDir);

//   // Filter for only `.zip` files and map them to full path + modified time
//   const zipFiles = files
//     .filter((f) => f.endsWith('.zip'))
//     .map((f) => {
//       const fullPath = path.join(downloadsDir, f);
//       return { fullPath, time: fs.statSync(fullPath).mtime };
//     })
//     .sort((a, b) => b.time - a.time); // Sort files from newest to oldest

//   // Return the full path of the newest ZIP file, or null if none found
//   return zipFiles.length > 0 ? zipFiles[0].fullPath : null;
// }

// function openPasswordProtectedPdf({ pdfPath, password }) {
//   return new Promise(async (resolve) => {
//     try {
//       const data = new Uint8Array(fs.readFileSync(pdfPath));
//       const loadingTask = pdfjsLib.getDocument({ data, password });
//       const pdfDoc = await loadingTask.promise;
//       resolve({ success: true, numPages: pdfDoc.numPages });
//     } catch (err) {
//       resolve({ success: false, error: err.message });
//     }
//   });
// }

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

// Task: Get the latest downloaded CSV file
const getDownloadedCSV = (downloadsDir) => {
  try {
    const files = fs.readdirSync(downloadsDir);
    const csvFiles = files
      .filter((file) => file.endsWith('.csv'))
      .map((file) => {
        const fullPath = path.join(downloadsDir, file);
        const stats = fs.statSync(fullPath);
        return { fullPath, time: stats.mtime };
      });

    csvFiles.sort((a, b) => b.time - a.time);

    return csvFiles.length > 0 ? csvFiles[0].fullPath : null;
  } catch (err) {
    console.error('Error finding CSV file:', err);
    return null;
  }
};

// Task: Download a file from a URL
const downloadFileToFolder = ({ url, fileName }) => {
  // Define the target downloads folder
  const downloadsFolder = 'C:\\..cypress\\downloads';
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
    dh_baseUrl: 'https://documenthub.edeja.com/',
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
      { id: 'L103', name: 'ISS' },
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
        prefixedTitle: 'Address Data - Title 1',
        prefixedTitle2: 'Address Data - Title 2',
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

    legacyTestuser: [
      {
        legacyURL:
          'http://10.5.10.34:8085/be.e-gehaltszettel_t/supportView/v1/legacy/submit',
        email: 'cy.legacy@yopmail.com',
        username: 'CYLegacyTestuser',
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
      { id: 'L103', name: 'ISS' },
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
    legacyTestuser: [
      {
        legacyURL:
          'https://e-gehaltszettel-t.post-business-solutions.at/be.e-gehaltszettel_t/supportView/v1/legacy/submit',
        email: 'cy.legacy@yopmail.com',
        username: 'CYLegacyTestuser',
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
      { id: 'L103', name: 'ISS' },
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
    legacyTestuser: [
      {
        legacyURL:
          'https://e-gehaltszettel.post-business-solutions.at/be.e-gehaltszettel/supportView/v1/legacy/submit',
        email: 'cy.legacy@yopmail.com',
        username: 'CYLegacyTestuser',
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
  ebrief_test: {
    baseUrl: 'https://www.e-brief.at/fe_t/login',
    username_kiam: 'kiam.t.mile@yopmail.com',
    password_kiam: 'Test1234!',
    origin: 'https://abn-login.post.at/',
  },
  ebrief_prod: {
    baseUrl: 'https://www.e-brief.at/fe/login',
    username_kiam: 'anna.testuser@yopmail.com',
    password_kiam: 'Test1234!',
    origin: 'https://login.post.at',
  },
  hs_post_test: {
    baseUrl:
      'https://hybridsign-t.post-business-solutions.at/hybridsign/sa/sh/',
    manager_1: '1_manager@yopmail.com',
    rootUrl: 'hybridsign-t.post-business-solutions.at',
    origin: 'https://kiamabn.b2clogin.com',
  },
  tages_dev: {
    usernameFromEmailBody: '',
    passwordFromEmailBody: '',
    baseUrl: 'https://tages-post.edeja.com/',

    username_stundung: 'k40.tages-post.testuser@yopmail.com',
    password_stundung: 'Test1234!',

    username_crteditCard: 'qa.testuser@yopmail.com',
    password_crteditCard: 'Test1234!',

    username_ILV: 'k106.tages-post.testuser@yopmail.com',
    password_ILV: 'Test1234!',

    menuLinks: [
      'Home',
      'Neue Sendung',
      'Offene Sendungen',
      'Auftragsliste',
      'Preise',
      'Tarifrechner',
      'Häufige Fragen',
      'Vorlagen',
    ],

    solutionsTitle: [
      'e-Gehaltszettel',
      'e-Signaturlösung',
      'Posteingangslösungen',
    ],

    sendungen: ['Neue Sendung', 'Offene Sendungen', 'Auftragsliste'],

    weiterführendeLinks: [
      'Preise',
      'Tarifrechner',
      'Häufige Fragen',
      'Vorlagen',
    ],

    solutionsData: {
      // solutionsTitle: [
      //   'e-Gehaltszettel',
      //   'e-Signaturlösung',
      //   'Intelligent Document Processing',
      // ],
      // solutionsP: [
      //   'Mitarbeiter*innen erhalten Gehalts- und Lohnabrechnungen papierlos und Sie profitieren von verbesserten Workflows durch die direkte Anbindung an das Lohnverrechnungssystem.',
      //   'Unterzeichnen Sie Dokumente, Verträge und mehr einfach digital, auch direkt am Point-of-Sale. So erhöht sich der Komfort für Ihre Kund*innen und vermeiden Medienbrüche.',
      //   'Ob Rechnungen, Formulare, Bestellungen oder der komplette Posteingang – wir digitalisieren Ihre eingehenden Sendungen für eine automatisierte Weiterverarbeitung.',
      //   ,
      // ],
      // solutionsLinks: [
      //   'Weiter zu e-Gehaltszettel',
      //   'Weiter zu e-Signaturlösung',
      //   'Weiter zu Posteingangslösungen',
      // ],
    },

    solutionsTitle: [
      'e-Gehaltszettel',
      'e-Signaturlösung',
      'Intelligent Document Processing',
    ],
    solutionsTxt: [
      'Mitarbeiter*innen erhalten Gehalts- und Lohnabrechnungen papierlos und Sie profitieren von verbesserten Workflows durch die direkte Anbindung an das Lohnverrechnungssystem.',
      'Unterzeichnen Sie Dokumente, Verträge und mehr einfach digital, auch direkt am Point-of-Sale. So erhöht sich der Komfort für Ihre Kund*innen und vermeiden Medienbrüche.',
      'Unsere Services digitalisieren und automatisieren Ihre Dokumentenprozesse. Mit der Plattform DAiTA verwandeln wir unstrukturierte Daten in nutzbare Informationen. Unsere Posteingangslösungen erfassen und verarbeiten Ihre Eingangspost effizient, während die Archivdigitalisierung Ihnen schnellen, ortsunabhängigen Zugriff auf Ihre Daten ermöglicht.',
    ],
    solutionsLink: [
      'Weiter zu e-Gehaltszettel',
      'Weiter zu e-Signaturlösung',
      'Weiter zu Intelligent Document Processing',
    ],
    footerTitle: [
      'HOTLINE: +43 800 2088 23',
      'SERVICES',
      'RECHTLICHE HINWEISE',
    ],
    footerLink: [
      'Servicezeiten:',
      'Montag – Donnerstag (werktags): 08:00 – 17:00',
      'Freitag (werktags): 08:00 – 14:00',
      'Paket versenden:',
      'Schnell versenden (Post Express)',
      'Paket empfangen',
      'Sendungsverfolgung',
      'Tarifrechner',
      'Immobilien',
      'Kontaktformular',
      'Impressum',
      'Rechtliche Hinweise / Datenschutzhinweise',
      'Alternative Streitbeilegung',
      'Allgemeine Geschäftsbedingungen',
    ],

    BitteWählenSieH2: ['Layout', 'Druck', 'Versandart', 'Zusatzleistungen'],

    // headerLinks: [
    //   'Home',
    //   'Neue Sendung',
    //   'Offene Sendungen',
    //   'Auftragsliste',
    //   'Preise',
    //   'Tarifrechner',
    //   'Häufige Fragen',
    //   'Vorlagen',
    // ],

    //   company: 'Aqua',
    //   companyPrefix: 'aqua',
    //   companyEmail: 'aqua.gmbh@yopmail.com',

    //   search: 'Android',
    //   username_supportViewAdmin: 'aquaAdmin',
    //   password_supportViewAdmin: 'Test1234!',
    //   email_supportViewAdmin: 'aqua.admin@yopmail.com',
    //   baseUrl_egEbox: 'https://eboxpayslip.edeja.com/fe.e-box_t/',
    //   username_egEbox: 'aquaABBA000100279311',
    //   password_egEbox: 'Test1234!',
    //   accountNumber_egEbox: 'ABBA000100279311',
    //   tagesBaseUrl: 'https://tages-post.edeja.com/',
    //   downloadsFolder:
    //     'C:/Users/mubavin/Cypress/EG/cypress-automatison-framework/cypress/downloads/',
    //   dashboardURL: 'https://supportviewpayslip.edeja.com/fe/dashboard/groups',
    //   eboxDeliveryPage: 'https://eboxpayslip.edeja.com/fe.e-box_t/deliveries',
    //   enableXML: [
    //     { id: 'T101', name: 'BB Care' },
    //     { id: 'T102', name: 'Beiersdorfer' },
    //     { id: 'L103', name: 'ISS' },
    //   ],
    //   disableXML: [
    //     { id: 'T101', name: 'BB Care' },
    //     { id: 'T102', name: 'Beiersdorfer' },
    //   ],
    //   enablePDFDictionary: [
    //     { name: 'PDFTABDictionary-200' },
    //     { name: 'PDFTABDictionary-301' },
    //     { name: 'PDFTABDictionary-305' },
    //   ],
    //   disablePDFDictionary: [
    //     { name: 'PDFTABDictionary-200' },
    //     { name: 'PDFTABDictionary-301' },
    //   ],
    //   createAdminUser: [
    //     {
    //       firstName: 'Mustermann',
    //       lastName: 'Admin',
    //       username: 'maxmustermannAdmin',
    //       email: 'max-mustermann@yopmail.com',
    //     },
    //   ],
    //   createUserNoAddress: [
    //     {
    //       firstName: 'No Address',
    //       lastName: 'Manual',
    //       username: 'manualNoAddress',
    //       email: 'manual.no-address@yopmail.com',
    //       countryCodePhoneNum: '+43',
    //       netNumberPhoneNum: '64',
    //       subscriberNumberPhoneNum: '706360',
    //       prefixedTitle: 'No Address Data - Title',
    //       // Explicitly set address fields to empty strings
    //       streetName: '',
    //       streetNumber: '',
    //       doorNumber: '',
    //       zipCode: '',
    //       city: '',
    //     },
    //   ],
    //   createUser: [
    //     {
    //       firstName: 'Address Data',
    //       lastName: 'Manual',
    //       username: 'manualAddress',
    //       email: 'manual.addres-data@yopmail.com',
    //       countryCodePhoneNum: '+43',
    //       netNumberPhoneNum: '64',
    //       subscriberNumberPhoneNum: '707777',
    //       streetName: 'Test Strasse',
    //       streetNumber: '17',
    //       doorNumber: '7',
    //       zipCode: '8010',
    //       city: 'Graz',
    //       prefixedTitle: 'Address Data - Title',
    //     },
    //   ],
    //   companyData: [
    //     {
    //       companyDispayName: 'Gmbh',
    //       description: 'Description GmbH',
    //       email: 'gmbh.sw@yopmail.com',
    //       sapCustomerNumber: '0000000777',
    //       streetName: 'Maine Strasse',
    //       doorNumber: 'doorNumber/17',
    //       zipCode: '8010',
    //       city: 'Maresse',
    //       userPrefix: 'uPr',
    //       subcompanyPrefix: 'sPr',
    //       subcompanyName: 'sNm',
    //       prefixLength: '10',
    //     },
    //   ],
    //   csvTestuser: [
    //     {
    //       accountNumber: 'ottoTestuser',
    //       email: 'otto.testuser@yopmail.com',
    //     },
    //   ],

    //   legacyTestuser: [
    //     {
    //       legacyURL:
    //         'http://10.5.10.34:8085/be.e-gehaltszettel_t/supportView/v1/legacy/submit',
    //       email: 'cy.legacy@yopmail.com',
    //       username: 'CYLegacyTestuser',
    //     },
    //   ],
  },
  tages_test: {
    usernameFromEmailBody: '',
    passwordFromEmailBody: '',
    baseUrl: 'https://abn-www.einfach-brief.at/fe_t/',

    username_stundung: 'k40.tages-post.testuser@yopmail.com',
    password_stundung: 'Test1234!',

    username_crteditCard: 'qa.testuser@yopmail.com',
    password_crteditCard: 'Test1234!',

    username_ILV: 'k106.tages-post.testuser@yopmail.com',
    password_ILV: 'Test1234!',

    menuLinks: [
      'Home',
      'Neue Sendung',
      'Offene Sendungen',
      'Auftragsliste',
      'Preise',
      'Tarifrechner',
      'Häufige Fragen',
      'Vorlagen',
    ],

    solutionsTitle: [
      'e-Gehaltszettel',
      'e-Signaturlösung',
      'Posteingangslösungen',
    ],

    sendungen: ['Neue Sendung', 'Offene Sendungen', 'Auftragsliste'],

    weiterführendeLinks: [
      'Preise',
      'Tarifrechner',
      'Häufige Fragen',
      'Vorlagen',
    ],

    solutionsData: {
      // solutionsTitle: [
      //   'e-Gehaltszettel',
      //   'e-Signaturlösung',
      //   'Intelligent Document Processing',
      // ],
      // solutionsP: [
      //   'Mitarbeiter*innen erhalten Gehalts- und Lohnabrechnungen papierlos und Sie profitieren von verbesserten Workflows durch die direkte Anbindung an das Lohnverrechnungssystem.',
      //   'Unterzeichnen Sie Dokumente, Verträge und mehr einfach digital, auch direkt am Point-of-Sale. So erhöht sich der Komfort für Ihre Kund*innen und vermeiden Medienbrüche.',
      //   'Ob Rechnungen, Formulare, Bestellungen oder der komplette Posteingang – wir digitalisieren Ihre eingehenden Sendungen für eine automatisierte Weiterverarbeitung.',
      //   ,
      // ],
      // solutionsLinks: [
      //   'Weiter zu e-Gehaltszettel',
      //   'Weiter zu e-Signaturlösung',
      //   'Weiter zu Posteingangslösungen',
      // ],
    },

    solutionsTitle: [
      'e-Gehaltszettel',
      'e-Signaturlösung',
      'Intelligent Document Processing',
    ],
    solutionsTxt: [
      'Mitarbeiter*innen erhalten Gehalts- und Lohnabrechnungen papierlos und Sie profitieren von verbesserten Workflows durch die direkte Anbindung an das Lohnverrechnungssystem.',
      'Unterzeichnen Sie Dokumente, Verträge und mehr einfach digital, auch direkt am Point-of-Sale. So erhöht sich der Komfort für Ihre Kund*innen und vermeiden Medienbrüche.',
      'Unsere Services digitalisieren und automatisieren Ihre Dokumentenprozesse. Mit der Plattform DAiTA verwandeln wir unstrukturierte Daten in nutzbare Informationen. Unsere Posteingangslösungen erfassen und verarbeiten Ihre Eingangspost effizient, während die Archivdigitalisierung Ihnen schnellen, ortsunabhängigen Zugriff auf Ihre Daten ermöglicht.',
    ],
    solutionsLink: [
      'Weiter zu e-Gehaltszettel',
      'Weiter zu e-Signaturlösung',
      'Weiter zu Intelligent Document Processing',
    ],
    footerTitle: [
      'HOTLINE: +43 800 2088 23',
      'SERVICES',
      'RECHTLICHE HINWEISE',
    ],
    footerLink: [
      'Servicezeiten:',
      'Montag – Donnerstag (werktags): 08:00 – 17:00',
      'Freitag (werktags): 08:00 – 14:00',
      'Paket versenden:',
      'Schnell versenden (Post Express)',
      'Paket empfangen',
      'Sendungsverfolgung',
      'Tarifrechner',
      'Immobilien',
      'Kontaktformular',
      'Impressum',
      'Rechtliche Hinweise / Datenschutzhinweise',
      'Alternative Streitbeilegung',
      'Allgemeine Geschäftsbedingungen',
    ],

    BitteWählenSieH2: ['Layout', 'Druck', 'Versandart', 'Zusatzleistungen'],

    // headerLinks: [
    //   'Home',
    //   'Neue Sendung',
    //   'Offene Sendungen',
    //   'Auftragsliste',
    //   'Preise',
    //   'Tarifrechner',
    //   'Häufige Fragen',
    //   'Vorlagen',
    // ],

    //   company: 'Aqua',
    //   companyPrefix: 'aqua',
    //   companyEmail: 'aqua.gmbh@yopmail.com',

    //   search: 'Android',
    //   username_supportViewAdmin: 'aquaAdmin',
    //   password_supportViewAdmin: 'Test1234!',
    //   email_supportViewAdmin: 'aqua.admin@yopmail.com',
    //   baseUrl_egEbox: 'https://eboxpayslip.edeja.com/fe.e-box_t/',
    //   username_egEbox: 'aquaABBA000100279311',
    //   password_egEbox: 'Test1234!',
    //   accountNumber_egEbox: 'ABBA000100279311',
    //   tagesBaseUrl: 'https://tages-post.edeja.com/',
    //   downloadsFolder:
    //     'C:/Users/mubavin/Cypress/EG/cypress-automatison-framework/cypress/downloads/',
    //   dashboardURL: 'https://supportviewpayslip.edeja.com/fe/dashboard/groups',
    //   eboxDeliveryPage: 'https://eboxpayslip.edeja.com/fe.e-box_t/deliveries',
    //   enableXML: [
    //     { id: 'T101', name: 'BB Care' },
    //     { id: 'T102', name: 'Beiersdorfer' },
    //     { id: 'L103', name: 'ISS' },
    //   ],
    //   disableXML: [
    //     { id: 'T101', name: 'BB Care' },
    //     { id: 'T102', name: 'Beiersdorfer' },
    //   ],
    //   enablePDFDictionary: [
    //     { name: 'PDFTABDictionary-200' },
    //     { name: 'PDFTABDictionary-301' },
    //     { name: 'PDFTABDictionary-305' },
    //   ],
    //   disablePDFDictionary: [
    //     { name: 'PDFTABDictionary-200' },
    //     { name: 'PDFTABDictionary-301' },
    //   ],
    //   createAdminUser: [
    //     {
    //       firstName: 'Mustermann',
    //       lastName: 'Admin',
    //       username: 'maxmustermannAdmin',
    //       email: 'max-mustermann@yopmail.com',
    //     },
    //   ],
    //   createUserNoAddress: [
    //     {
    //       firstName: 'No Address',
    //       lastName: 'Manual',
    //       username: 'manualNoAddress',
    //       email: 'manual.no-address@yopmail.com',
    //       countryCodePhoneNum: '+43',
    //       netNumberPhoneNum: '64',
    //       subscriberNumberPhoneNum: '706360',
    //       prefixedTitle: 'No Address Data - Title',
    //       // Explicitly set address fields to empty strings
    //       streetName: '',
    //       streetNumber: '',
    //       doorNumber: '',
    //       zipCode: '',
    //       city: '',
    //     },
    //   ],
    //   createUser: [
    //     {
    //       firstName: 'Address Data',
    //       lastName: 'Manual',
    //       username: 'manualAddress',
    //       email: 'manual.addres-data@yopmail.com',
    //       countryCodePhoneNum: '+43',
    //       netNumberPhoneNum: '64',
    //       subscriberNumberPhoneNum: '707777',
    //       streetName: 'Test Strasse',
    //       streetNumber: '17',
    //       doorNumber: '7',
    //       zipCode: '8010',
    //       city: 'Graz',
    //       prefixedTitle: 'Address Data - Title',
    //     },
    //   ],
    //   companyData: [
    //     {
    //       companyDispayName: 'Gmbh',
    //       description: 'Description GmbH',
    //       email: 'gmbh.sw@yopmail.com',
    //       sapCustomerNumber: '0000000777',
    //       streetName: 'Maine Strasse',
    //       doorNumber: 'doorNumber/17',
    //       zipCode: '8010',
    //       city: 'Maresse',
    //       userPrefix: 'uPr',
    //       subcompanyPrefix: 'sPr',
    //       subcompanyName: 'sNm',
    //       prefixLength: '10',
    //     },
    //   ],
    //   csvTestuser: [
    //     {
    //       accountNumber: 'ottoTestuser',
    //       email: 'otto.testuser@yopmail.com',
    //     },
    //   ],

    //   legacyTestuser: [
    //     {
    //       legacyURL:
    //         'http://10.5.10.34:8085/be.e-gehaltszettel_t/supportView/v1/legacy/submit',
    //       email: 'cy.legacy@yopmail.com',
    //       username: 'CYLegacyTestuser',
    //     },
    //   ],
  },
}; //end environmets

const credentials = {}; // Temporary global storage for credentials
module.exports = defineConfig({
  defaultCommandTimeout: 6000,
  viewportWidth: 1920,
  viewportHeight: 1080,

  e2e: {
    chromeWebSecurity: false,
    experimentalSessionAndOrigin: true,
    setupNodeEvents(on, config) {
      // Register the downloadFile task
      on('task', {
        extractPasswordProtectedZip,
        downloadZipAndReadFirstPdf,
        openPasswordProtectedPdf,
        getDownloadedPdf,
        getDownloadedCSV,
        getDownloadedZIP,
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
        getExtractedPdf(folder) {
          const fs = require('fs');
          const path = require('path');

          const pdfs = fs.readdirSync(folder).filter((f) => f.endsWith('.pdf'));
          if (pdfs.length > 0) {
            return path.join(folder, pdfs[0]);
          }
          return null;
        },
        openCSV(filePath) {
          exec(`start "" "${filePath}"`);
          return null;
        },
        readHeaderLinks() {
          // Always read the file fresh to avoid stale values
          const configPath = path.resolve(__dirname, 'cypress.config.js');
          const fileContent = fs.readFileSync(configPath, 'utf-8');

          // Use regex to extract headerLinks array
          const match = fileContent.match(/headerLinks:\s*\[([\s\S]*?)\]/);
          if (match) {
            return match[1]
              .split(',')
              .map((s) => s.replace(/['"\n\r]/g, '').trim())
              .filter(Boolean);
          }
          return [];
        },
        readSendungenLinks() {
          // Always read the file fresh to avoid stale values
          const configPath = path.resolve(__dirname, 'cypress.config.js');
          const fileContent = fs.readFileSync(configPath, 'utf-8');

          // Use regex to extract headerLinks array
          const match = fileContent.match(/sendungen:\s*\[([\s\S]*?)\]/);
          if (match) {
            return match[1]
              .split(',')
              .map((s) => s.replace(/['"\n\r]/g, '').trim())
              .filter(Boolean);
          }
          return [];
        },
        readWeiterführendeLinks() {
          // Always read the file fresh to avoid stale values
          const configPath = path.resolve(__dirname, 'cypress.config.js');
          const fileContent = fs.readFileSync(configPath, 'utf-8');

          // Use regex to extract headerLinks array
          const match = fileContent.match(
            /weiterführendeLinks:\s*\[([\s\S]*?)\]/
          );
          if (match) {
            return match[1]
              .split(',')
              .map((s) => s.replace(/['"\n\r]/g, '').trim())
              .filter(Boolean);
          }
          return [];
        },
        getSolutionsData() {
          const configPath = path.resolve(__dirname, '../cypress.config.js');
          const fileContent = fs.readFileSync(configPath, 'utf-8');

          // Use regex to extract the solutionsData object from the file content
          const solutionsDataMatch = fileContent.match(
            /solutionsData:\s*({[\s\S]*?})/
          );

          if (solutionsDataMatch) {
            const solutionsData = JSON.parse(solutionsDataMatch[1]);
            return solutionsData;
          }

          return {}; // Return empty if not found
        },

        /*********************************** */
      });
      //  Set executing tests on various environments, targeting appropriate json from const=environments
      const envConfig = environments['eg_dev'];
      return { ...config, env: { ...config.env, ...envConfig } };
    }, //end
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}', // Ensure this matches your structure
    chromeWebSecurity: false,
    headless: false, // Turn off headless mode for debugging
    baseUrl: 'https://www.e-brief.at/fe_t',
  },
});
