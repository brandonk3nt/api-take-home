export default async function main() {
  const response = await fetch('http://test.brightsign.io:3000');

  if (!response.ok) {
    throw new Error('Failed to fetch URL');
  }

  const data = await response.json();
  const jsonString = JSON.stringify(data);
  return JSON.parse(jsonString);
}

main();