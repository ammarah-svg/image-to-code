// pages/api/image-to-code.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your .env.local file
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { imageData } = req.body;

      if (!imageData) {
        return res.status(400).json({ error: 'Image data is required' });
      }

      // Call the OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Use the appropriate model for your use case
        messages: [{ role: 'user', content: 'Convert this image into HTML/CSS code' }],
        // You might need to send image data differently, depending on the OpenAI API capabilities.
      });

      res.status(200).json({ code: completion.choices[0].message.content });
    } catch (error) {
      console.error('Error generating code from image:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}