// components/ImageUploader.js
import { useState } from 'react';
import * as tf from '@tensorflow/tfjs';

const ImageUploader = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1]; // Get the base64 part of the image
      setLoading(true);
      try {
        const processedImage = await processImage(base64Image);
        const response = await fetch('/api/image-to-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: processedImage }), // Send processed image data as JSON
        });

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

  const processImage = async (base64Image) => {
    // Convert base64 to an image element
    const img = new Image();
    img.src = `data:image/jpeg;base64,${base64Image}`;

    return new Promise((resolve) => {
      img.onload = async () => {
        // Preprocess the image for the model
        const tensorImg = tf.browser.fromPixels(img).resizeNearestNeighbor([224, 224]).toFloat().expandDims();
        
        // Load a pre-trained model (e.g., MobileNet)
        const model = await tf.loadLayersModel('https://tfhub.dev/google/imagenet/mobilenet_v2_100_224/classification/4');

        // Make a prediction
        const predictions = await model.predict(tensorImg).data();
        const topPrediction = Array.from(predictions).map((p, i) => ({
          probability: p,
          className: IMAGENET_CLASSES[i], // You need to define this mapping
        })).sort((a, b) => b.probability - a.probability)[0];

        resolve(`This image is likely a ${topPrediction.className} with a confidence of ${topPrediction.probability.toFixed(2)}`);
      };
    });
  };

  // Example mapping for ImageNet classes (you can expand this)
  const IMAGENET_CLASSES = {
    0: 'tench',
    1: 'goldfish',
    2: 'great white shark',
    // Add more classes as needed
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
};

export default ImageUploader;