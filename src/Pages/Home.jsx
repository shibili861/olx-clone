import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import { AuthContext } from '../store/Context';

export default function Home() {
  const [products, setProducts] = useState([]);
  // Stores a map of { [productId]: wishlistDocId } so we know what is saved
  const [wishlistMap, setWishlistMap] = useState({});
  const [showWishlist, setShowWishlist] = useState(false);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // 1. Fetch all public products
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productArray = querySnapshot.docs.map(docSnap => ({
          ...docSnap.data(),
          id: docSnap.id
        }));
        setProducts(productArray);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);






  // 2. Fetch logged-in user's saved wishlist IDs so hearts render in active state
  useEffect(() => {
    const fetchUserWishlist = async () => {
      if (!user) {
        setWishlistMap({});
        return;
      }
      try {
        const q = query(collection(db, 'wishlist'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const map = {};
        querySnapshot.docs.forEach(docSnap => {
          map[docSnap.data().productId] = docSnap.id;
        });
        setWishlistMap(map);
      } catch (error) {
        console.error("Error fetching user wishlist:", error);
      }
    };
    fetchUserWishlist();
  }, [user]);

  // 3. True Toggle Function: Normal -> Active (Add) | Active -> Normal (Remove)
  const handleToggleWishlistItem = async (e, product) => {
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    const existingWishlistDocId = wishlistMap[product.id];

    try {
      if (existingWishlistDocId) {
        // Item is already in wishlist -> Remove it (Return to Normal State)
        await deleteDoc(doc(db, 'wishlist', existingWishlistDocId));
        setWishlistMap(prev => {
          const updated = { ...prev };
          delete updated[product.id];
          return updated;
        });
      } else {
        // Item is not in wishlist -> Add it (Switch to Focused/Active State)
        const docRef = await addDoc(collection(db, 'wishlist'), {
          userId: user.uid,
          productId: product.id,
          productName: product.name,
          price: product.price,
          url: product.url,
          category: product.category
        });
        setWishlistMap(prev => ({
          ...prev,
          [product.id]: docRef.id
        }));
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setShowWishlist(false);
    setWishlistMap({});
    navigate('/login');
  };

  // Filter products when the navbar Wishlist tab is active
  const wishlistCount = Object.keys(wishlistMap).length;
  const displayedProducts = showWishlist 
    ? products.filter(p => Boolean(wishlistMap[p.id])) 
    : products;

  return (
    <div>
      {/* OLX Navbar */}
      <header className="header">
        <h1 className="olx-logo" onClick={() => setShowWishlist(false)}>OLX</h1>
        
        <div className="nav-actions">
          {user ? (
            <>
              <span style={{ fontWeight: 'bold' }}>Hi, {user.displayName || 'User'}</span>
              
              {/* Premium Navbar Pill Switcher */}
              <button 
                className={`wishlist-nav-toggle ${showWishlist ? 'active-tab' : ''}`} 
                onClick={() => setShowWishlist(!showWishlist)}
              >
                <span>{showWishlist ? '♥ Wishlist View' : '♡ Wishlist'}</span>
                {wishlistCount > 0 && (
                  <span className="wishlist-badge">{wishlistCount}</span>
                )}
              </button>

              <button className="nav-link" onClick={handleLogout}>Logout</button>
              <button className="sell-button" onClick={() => navigate('/create')}>+ Sell</button>
            </>
          ) : (
            <>
              <button className="nav-link" onClick={() => navigate('/login')}>Login</button>
              <button className="sell-button" onClick={() => navigate('/create')}>+ Sell</button>
            </>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div className="home-container">
        <h2>{showWishlist ? 'My Saved Wishlist' : 'Fresh recommendations'}</h2>
        
        {displayedProducts.length === 0 ? (
          <p style={{ marginTop: '20px', color: '#707a7c' }}>
            {showWishlist ? 'Your wishlist is empty. Tap the heart on any product to save it!' : 'No products found.'}
          </p>
        ) : (
          <div className="product-grid">
            {displayedProducts.map((product) => {
              const isWishlisted = Boolean(wishlistMap[product.id]);

              return (
                <div 
                  key={product.id} 
                  className="product-card" 
                  onClick={() => navigate(`/view/${product.id}`)}
                >
                  {/* Premium Heart Toggle Button (Normal SVG vs Focused Filled SVG) */}
                  <button 
                    className={`wishlist-btn ${isWishlisted ? 'active' : ''}`} 
                    onClick={(e) => handleToggleWishlistItem(e, product)}
                    title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill={isWishlisted ? "currentColor" : "none"} 
                      stroke="currentColor" 
                      strokeWidth="2.2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                  
                  <img src={product.url} alt={product.name} className="card-image" />
                  <h2 className="card-price">₹ {Number(product.price).toLocaleString('en-IN')}</h2>
                  <p className="card-title">{product.name}</p>
                  <p className="card-category">{product.category}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}