import { useState } from 'react';

export default function Home() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1]; // Get the base64 part of the image
      setLoading(true);
      try {
        const response = await fetch('/api/image-to-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: base64Image }), // Send the image data as JSON
        });

        // Check if the response is not okay (status code not in the range 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Parse the response as JSON
        setCode(data.code || 'Error generating code'); // Set the generated code or an error message
      } catch (error) {
        console.error('Error:', error);
        setCode('Error generating code'); // Set an error message if something goes wrong
      } finally {
        setLoading(false); // Reset loading state
      }
    };

    reader.readAsDataURL(file); // Read the uploaded image as a data URL
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Image to Code</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {loading && <p>Loading...</p>}
      {code && (
        <div>
          <h2>Generated Code:</h2>
          <pre>{code}</pre>
        </div>
      )}
    </div>
  );
}