const response = await fetch('http://localhost:3001/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
});

const contentType = response.headers.get('content-type');
let payload;
if (contentType && contentType.includes('application/json')) {
  payload = await response.json();
} else {
  payload = await response.text();
}

console.log('Status:', response.status);
console.log('Response:', payload);
