/**
 * DH Self-Registration Page Selectors
 * 
 * Source: DH Production Registration Page
 * Last Updated: 2026-05-11
 * AI-Generated: Based on HTML analysis
 */

export const registrationSelectors = {
  // Form container
  form: 'form[aria-label="registration form"]',

  // Company Data Section
  companyData: {
    section: 'section[aria-label="user company data section"]',
    companyName: 'input[name="companyName"]',
    uidNumber: 'input[name="uidNumber"]',
  },

  // Address Section
  address: {
    section: 'section[aria-label="user address section"]',
    street: 'input[name="street"]',
    doorNumber: 'input[name="doorNumber"]',
    state: 'input[name="state"]',
    postalCode: 'input[name="postalCode"]',
    city: 'input[name="city"]',
  },

  // Personal Data Section
  personalData: {
    section: 'section[aria-label="user data section"]',
    firstName: 'input[name="firstName"]',
    lastName: 'input[name="lastName"]',
  },

  // User/Email Section
  userData: {
    section: 'section[aria-label="email section"]',
    email: 'input[name="email"]',
    confirmEmail: 'input[name="confirmEmail"]',
    username: 'input[name="username"]',
  },

  // Password Section
  password: {
    section: 'section[aria-label="password section"]',
    password: 'input[name="password"]',
    confirmPassword: 'input[name="confirmPassword"]',
    showPasswordToggle: 'button.iconbtn', // eye icon
    strengthIndicator: 'section[aria-label="password strength indicator section"]',
  },

  // Terms & Conditions
  terms: {
    checkbox: 'input[name="agbTerms"]',
    agbLink: 'a[href*="agb-brief"]',
    datenschutzLink: 'a[href*="datenschutz"]',
  },

  // Captcha
  captcha: {
    container: '.frc-captcha',
    restartButton: '.frc-button',
    solution: 'input[name="frc-captcha-solution"]',
  },

  // Submit Button
  submitButton: 'button[type="submit"]',
  registerButtonText: 'Registrieren',

  // Success/Error Messages
  snackbar: '.mat-mdc-simple-snack-bar > .mat-mdc-snack-bar-label',

  // Alternative selectors for bilingual support
  bilingualSelectors: {
    companyName: 'input[placeholder*="Post AG"], input[name="companyName"]',
    street: 'input[placeholder*="Mariahilferstraße"], input[name="street"]',
    firstName: 'input[placeholder*="Georg"], input[name="firstName"]',
    email: 'input[placeholder*="email"], input[type="email"]',
  },
};

// Yopmail Selectors (for email confirmation)
export const yopmailSelectors = {
  loginInput: '#login',
  refreshButton: '#refreshbut > .md > .material-icons-outlined',
  inboxIframe: '#ifinbox',
  mailIframe: '#ifmail',
  
  // Email list selectors
  emailSubject: '.mctn > .m > button > .lms',
  
  // Email body selectors
  mailBody: 'p, div.mail-body, .msg',
  confirmationLink: 'a[href*="confirm"], a[href*="bestätigen"], a[href*="activate"]',
};

// DH Login Selectors (after confirmation)
export const dhLoginSelectors = {
  usernameField: 'input[name="userName"], input[placeholder*="Username"], input[placeholder*="Benutzername"]',
  passwordField: 'input[name="password"], input[type="password"]',
  loginButton: 'button[type="submit"]',
  cookieBanner: '#onetrust-accept-btn-handler',
  userMenu: '.user-title',
  logoutButton: '.logout-title > a',
};
