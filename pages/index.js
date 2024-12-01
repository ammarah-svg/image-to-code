// pages/index.js
import { useState } from 'react';

export default function Home() {
  const [image, setImage] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1]; // Get base64 string

      setLoading(true);
      try {
        const response = await fetch('/api/image-to-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageData: base64Image }),
        });
        const data = await response.json();
        if (data.code) {
          setCode(data.code); // Display generated code
        } else {
          setCode('Error generating code');
        }
      } catch (error) {
        console.error('Error:', error);
        setCode('Error generating code');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(file); // Convert image to base64
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
