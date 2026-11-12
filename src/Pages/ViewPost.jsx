import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function ViewPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = docSnap.data();
          setProduct(productData);

          const q = query(collection(db, 'users'), where('id', '==', productData.userId));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            setSeller(doc.data());
          });
        }
      } catch (error) {
        console.error("Error fetching post details:", error);
      }
    };

    fetchPostDetails();
  }, [id]);

  if (!product) {
    return <div style={{ padding: '60px', textAlign: 'center', fontSize: '18px' }}>Loading product details...</div>;
  }

  return (
    <div>
      <header className="header">
        <h1 className="olx-logo" onClick={() => navigate('/')}>OLX</h1>
        <button className="nav-link" onClick={() => navigate('/')}>← Back to Home</button>
      </header>

      <div className="view-container">
        {/* Left: Product Image */}
        <div className="view-image-box">
          <img src={product.url} alt={product.name} />
        </div>

        {/* Right: Price & Seller Info */}
        <div className="view-sidebar">
          <div className="info-card">
            <h1 style={{ fontSize: '34px', margin: '0 0 8px 0' }}>
              ₹ {Number(product.price).toLocaleString('en-IN')}
            </h1>
            <p style={{ fontSize: '18px', color: '#406367', margin: '0 0 12px 0' }}>{product.name}</p>
            <span style={{ background: '#ebeeef', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
              {product.category}
            </span>
            <p style={{ fontSize: '12px', color: '#707a7c', marginTop: '20px' }}>
              Posted on: {new Date(product.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="info-card">
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>Seller Details</h3>
            {seller ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: 0, fontSize: '16px' }}><strong>Name:</strong> {seller.username}</p>
                <p style={{ margin: 0, fontSize: '16px' }}><strong>Phone:</strong> {seller.phone}</p>
                <button className="btn-primary" style={{ marginTop: '12px' }} onClick={() => alert(`Call seller at: ${seller.phone}`)}>
                  Chat with seller
                </button>
              </div>
            ) : (
              <p style={{ color: '#707a7c' }}>Seller contact verified</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}