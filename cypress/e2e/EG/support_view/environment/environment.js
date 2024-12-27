export async function getTestData() {
  const response = await fetch('../');
  const testData = await response.json(); // Load and store the JSON data
  console.log('Fetched Data:', testData); // For debugging
  return testData;
}
