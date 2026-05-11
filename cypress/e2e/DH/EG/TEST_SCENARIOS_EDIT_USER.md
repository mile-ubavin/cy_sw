# Test Scenarios: Edit User Data

## Based on UI Analysis (Screenshots)

### UI Components Identified:

1. **Employees Table Page**
   - Search/Filter functionality
   - Company selector dropdown
   - User table with columns: Name, Personal Number, Username, Email, Phone Number, Email Active, Delivery Type, Status
   - Action menu (3-dot menu) with options: Edit, Deactivate, Reset Password, Companies, Open Ebox

2. **Edit User Form**
   - **Personal Data Section**: Username, Title 1, First Name, Last Name, Title 2
   - **Contact & Address Section**: Mobile Phone Number, Email Address, Street, House No, ZIP Code, City, Country
   - **Personal Number & Status Section**: Company, Personal Number, Status, Delivery Type

3. **Add Personal Number Dialog**
   - Company field (pre-filled)
   - Company Prefix field (pre-filled)
   - Personal Number input
   - Save/Cancel buttons

4. **Unsaved Changes Dialog**
   - Warning message
   - Save button
   - Back to Employees page button

5. **Activities Tab**
   - Log table with columns: Display Name, Date, Activity, Log
   - Shows all update history

---

## Test Scenarios

### TC01 - Navigation to Edit User Page

**Objective**: Verify user can navigate to edit user page via action menu

**Steps**:

1. Login to DH application
2. Navigate to Employees page
3. Select company from dropdown
4. Search for specific user using filters
5. Open 3-dot action menu
6. Click "Edit" option

**Expected Result**:

- Edit user page opens
- Overview tab is active
- Personal Data section is visible

---

### TC02 - Edit Personal Data Fields

**Objective**: Verify user can edit personal data fields successfully

**Fields to Test**:

- Title 1 (Prefix title)
- First Name
- Last Name
- Title 2 (Suffix title)

**Steps**:

1. Navigate to edit user page
2. Modify all personal data fields
3. Click "Save Changes"
4. Verify save success

**Expected Result**:

- All fields accept input
- Changes are saved successfully
- User is redirected to employees table
- API returns 200/201 status

---

### TC03 - Edit Contact & Address Fields

**Objective**: Verify user can edit contact and address information

**Fields to Test**:

- Mobile Phone Number
- Email Address
- Street
- House Number
- ZIP Code
- City
- Country (dropdown)

**Steps**:

1. Navigate to edit user page
2. Update all contact and address fields
3. Select country from dropdown
4. Save changes

**Expected Result**:

- All fields accept valid input
- Country dropdown works correctly
- Changes save successfully

---

### TC04 - Email Validation

**Objective**: Verify email field validation

**Test Cases**:

**Invalid Email**:

- Input: `invalid_email_format`
- Expected: Error message "Invalid email format" appears

**Valid Email**:

- Input: `valid_email@example.com`
- Expected: No error message

**Steps**:

1. Navigate to edit user page
2. Enter invalid email and blur field
3. Verify error message appears
4. Enter valid email and blur field
5. Verify error message disappears

---

### TC05 - ZIP Code Validation for Austria

**Objective**: Verify ZIP code validation rules for Austria

**Validation Rules**:

- Austria: Must be exactly 4 digits
- Other countries: No specific validation

**Test Cases**:

**Austria + Invalid ZIP (5 digits)**:

- Country: Austria
- ZIP: `12345`
- Expected: Error "Invalid format (4 digits)"

**Austria + Valid ZIP (4 digits)**:

- Country: Austria
- ZIP: `1010`
- Expected: No error

**Steps**:

1. Navigate to edit user page
2. Select Austria from country dropdown
3. Enter 5-digit ZIP code
4. Verify error message
5. Enter 4-digit ZIP code
6. Verify no error

---

### TC06 - Add Personal Number

**Objective**: Verify user can add new personal number to existing user

**Steps**:

1. Navigate to edit user page
2. Scroll to "Personal Number & Status" section
3. Click "Add" button (blue icon button)
4. Verify "Add New Personal Number" dialog opens
5. Verify Company and Prefix are pre-filled
6. Enter new personal number
7. Click "Save"
8. Verify dialog closes

**Expected Result**:

- Dialog opens correctly
- Fields are pre-filled with correct company data
- New personal number is saved
- API returns 200/201 status

---

### TC07 - Unsaved Changes Warning (Discard)

**Objective**: Verify unsaved changes warning appears when navigating away

**Steps**:

1. Navigate to edit user page
2. Make changes to any field (e.g., First Name)
3. Click "Back" button without saving
4. Verify "Unsaved Changes" dialog appears
5. Verify dialog message asks to save changes
6. Click "Back to Employees page"
7. Verify navigation back to employees table

**Expected Result**:

- Changes trigger unsaved state
- Warning dialog appears
- Both "Save" and "Back" buttons are visible
- Clicking "Back" discards changes and navigates away

---

### TC08 - Unsaved Changes Warning (Save)

**Objective**: Verify user can save changes from unsaved changes dialog

**Steps**:

1. Navigate to edit user page
2. Make changes to any field
3. Click "Back" button
4. Verify "Unsaved Changes" dialog appears
5. Click "Save" button in dialog
6. Verify changes are saved
7. Verify navigation back to employees

**Expected Result**:

- Dialog "Save" button saves changes
- API call is successful (200/201)
- User is navigated back to employees table
- Changes are persisted

---

### TC09 - Activities Log Verification

**Objective**: Verify all changes are logged in Activities tab

**Steps**:

1. Navigate to edit user page
2. Make changes to fields
3. Save changes
4. Navigate to "Activities" tab
5. Verify update entries appear in log
6. Verify log details contain field names and values

**Expected Result**:

- Activities table is visible
- Table has columns: Display Name, Date, Activity, Log
- "Update" activities are logged
- Log column shows detailed change information
- Field names (e.g., "firstName") appear in log

---

### TC10 - Reset Password Action Availability

**Objective**: Verify Reset Password action is available

**Steps**:

1. Navigate to edit user page
2. Scroll to "Personal Number & Status" section
3. Verify "Reset Password" link/button exists
4. Verify it is clickable

**Expected Result**:

- "Reset Password" action is visible
- Button/link is enabled
- (Note: Don't trigger actual password reset in automated tests)

---

## Test Data Requirements

### User Test Data (from cypress.config.js):

```javascript
{
  username: "testUser",
  prefixedTitle: "Dr.",
  firstName: "Test",
  lastName: "User",
  prefixedTitle2: "MBA",
  email: "test@example.com",
  phone: "+43 123 456 7890",
  streetName: "Test Street",
  streetNumber: "123",
  doorNumber: "4",
  zipCode: "1010",
  city: "Vienna",
  country: "Austria"
}
```

### Company:

- Name: "AQUA GmbH"
- Prefix: "aqua - Aqua"

---

## Validation Rules Summary

| Field              | Validation Rule        | Error Message (EN/DE)                                                     |
| ------------------ | ---------------------- | ------------------------------------------------------------------------- |
| Email              | Valid email format     | "Invalid email format" / "E-Mail-Format ist ungültig"                     |
| ZIP Code (Austria) | Exactly 4 digits       | "Invalid format (4 digits)" / "Ungültiges Format (4 Ziffern)"             |
| ZIP Code (Other)   | No specific validation | N/A                                                                       |
| Phone Number       | Include country code   | "Invalid value. Please enter the phone number including the country code" |
| Required Fields    | Cannot be empty        | "Required field" / "Pflichtfeld"                                          |

---

## API Endpoints

| Action              | Method | Endpoint                 | Success Status |
| ------------------- | ------ | ------------------------ | -------------- |
| Get Employees       | GET    | `**/person/fromGroup/**` | 200            |
| Edit Person         | POST   | `**/editPerson`          | 200, 201       |
| Add Personal Number | POST   | `**/person/**`           | 200, 201       |

---

## Notes

1. All tests support **bilingual** UI (German/English)
2. Tests use **dynamic selectors** to handle both language versions
3. **Stale element prevention**: Text content is stored instead of element references
4. **Proper waits**: API interceptors ensure stable test execution
5. **Isolation**: Each test navigates independently (no test dependencies)

---

## Coverage

- ✅ Navigation and page loading
- ✅ Form field editing
- ✅ Validation (Email, ZIP Code)
- ✅ Dropdown selections (Company, Country)
- ✅ Dialog interactions (Add Personal Number, Unsaved Changes)
- ✅ Save functionality
- ✅ Activity logging
- ✅ Action menu options
- ✅ Bilingual support (DE/EN)

---

## Future Enhancements

1. Test other action menu options (Deactivate, Companies, Open Ebox)
2. Test CSV import/update functionality
3. Test pagination in employees table
4. Test advanced filtering options
5. Test sorting in employees table and activities log
6. Test different user roles and permissions
7. Test error handling for network failures
8. Test concurrent editing scenarios
