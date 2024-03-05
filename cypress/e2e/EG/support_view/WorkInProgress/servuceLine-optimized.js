/// <reference types="Cypress" />

describe("Upload serviceLine pdf file and chec emails", () => {
  it(`Upload serviceLine pdf by Admn User and check emails`, function () {
    cy.fixture("requestRegisterLegacy(2024)-4Users.xml").then((xmlContent) => {
      cy.request({
        method: "POST",
        url: "http://10.5.10.34:8085/be.e-gehaltszettel_t/supportView/v1/legacy/submit",
        headers: {
          "Content-Type": "application/xml",
        },
        body: xmlContent,
      }).then((response) => {
        // Validate the response
        expect(response.status).to.eq(200);
        expect(response.body).to.contain("<ReplyCode>0</ReplyCode>");
        expect(response.body).to.contain("<ReplyMessage>OK.</ReplyMessage>");

        // Parse the XML response body if necessary
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.body, "text/xml");

        // Access XML elements and attributes
        const summary = xmlDoc.getElementsByTagName("Summary")[0];
        const okNumber = summary
          .getElementsByTagName("OK")[0]
          .getElementsByTagName("Number")[0].textContent;
        const nokNumber = summary
          .getElementsByTagName("NOK")[0]
          .getElementsByTagName("Number")[0].textContent;

        // Perform assertions on the parsed XML data
        expect(parseInt(okNumber)).to.eq(0);
        expect(parseInt(nokNumber)).to.eq(5);
      });
    });
    cy.log("Test completed successfully.");
  }); //end it
});
