import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; 
import { AuthContext } from '../store/Context';

export default function Create() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Your exact ImgBB API key is hardcoded here
  const IMGBB_API_KEY = "d9ec8e29c5a93ed5498061e566bd91ba"; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Security check: Ensure the user is still logged in
    if (!user) {
      alert('You must be logged in to sell a product.');
      navigate('/login');
      return;
    }

    if (!image) {
      alert('Please select an image file.');
      return;
    }
    
    setLoading(true);

    try {
      console.log("1. Starting image upload to ImgBB...");
      const formData = new FormData();
      formData.append('image', image);

      // Upload to ImgBB
      const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      
      const imgbbData = await imgbbResponse.json();
      console.log("2. ImgBB Response received:", imgbbData);

      // Check if ImgBB rejected the image
      if (!imgbbData.success) {
        throw new Error("ImgBB rejected the file. Try a smaller image or different format.");
      }
      
      const imageUrl = imgbbData.data.display_url;
      console.log("3. Image URL secured:", imageUrl);
      console.log("4. Saving product details to Firebase...");

      // Save to Firestore
      await addDoc(collection(db, 'products'), {
        name: name,
        category: category,
        price: Number(price),
        url: imageUrl, 
        userId: user.uid, 
        createdAt: new Date().toISOString()
      });

      console.log("5. Success! Redirecting to Home page...");
      navigate('/');

    } catch (error) {
      console.error("UPLOAD CRASHED:", error);
      alert("Error: " + error.message);
    } finally {
      // This ensures the button always resets, even if there is an error
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '15px' }}>
        <h2>Sell a Product</h2>
        
        <input 
          type="text" 
          placeholder="Product Name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
        />
        
        <input 
          type="text" 
          placeholder="Category" 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required 
        />
        
        <input 
          type="number" 
          placeholder="Price (₹)" 
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required 
        />

        {image && (
          <img 
            alt="Preview" 
            width="200px" 
            height="200px" 
            src={URL.createObjectURL(image)} 
            style={{ objectFit: 'cover', margin: '0 auto' }}
          />
        )}
        
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required 
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload and List Product'}
        </button>
      </form>
    </div>
  );
}