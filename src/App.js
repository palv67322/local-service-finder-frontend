import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

const Signup = ({ setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://local-service-finder-backend.onrender.com/api/signup', {
        name,
        email,
        password,
        role
      });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      window.location.href = '/';
    } catch (err) {
      setError('Signup failed. Email may already exist.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Signup</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          >
            <option value="user">User</option>
            <option value="provider">Provider</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">Signup</button>
        </form>
        <p className="mt-4">
          Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </div>
    </div>
  );
};

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://local-service-finder-backend.onrender.com/api/login', {
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      window.location.href = '/';
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">Login</button>
        </form>
        <p className="mt-4">
          Don't have an account? <Link to="/signup" className="text-blue-600">Signup</Link>
        </p>
      </div>
    </div>
  );
};

const ServiceDetails = ({ user }) => {
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const fetchService = async () => {
      const id = window.location.pathname.split('/')[2];
      try {
        const response = await axios.get(`https://local-service-finder-backend.onrender.com/api/services/${id}`);
        setService(response.data);
        const reviewsResponse = await axios.get(`https://local-service-finder-backend.onrender.com/api/reviews/${id}`);
        setReviews(reviewsResponse.data);
      } catch (error) {
        console.error('Error fetching service:', error);
      }
    };
    fetchService();
  }, []);

  const handleBooking = async () => {
    if (!user) {
      alert('Please login to book');
      return;
    }
    try {
      const response = await axios.post('https://local-service-finder-backend.onrender.com/api/bookings', {
        serviceId: service._id,
        userId: user._id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Razorpay Integration
      const options = {
        key: 'rzp_test_x1BNfcKz3XtHjz', // Replace with your Razorpay Key ID
        amount: service.price * 100, // Price in paise
        currency: 'INR',
        name: 'Local Service Finder',
        description: `Booking for ${service.title}`,
        order_id: response.data.orderId,
        handler: async (response) => {
          await axios.post('https://local-service-finder-backend.onrender.com/api/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          alert('Booking and payment successful!');
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error booking:', error);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://local-service-finder-backend.onrender.com/api/reviews', {
        serviceId: service._id,
        userId: user._id,
        text: reviewText,
        rating
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReviewText('');
      setRating(5);
      alert('Review submitted!');
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (!service) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold">{service.title}</h2>
      <p>Category: {service.category}</p>
      <p>Location: {service.location}</p>
      <p>Price: ₹{service.price}/hr</p>
      <p>Provider: {service.provider.name}</p>
      <button onClick={handleBooking} className="bg-green-600 text-white p-2 rounded mt-4">Book Now</button>
      <div className="mt-6">
        <h3 className="text-xl font-bold">Reviews</h3>
        {reviews.map((review) => (
          <div key={review._id} className="border p-2 my-2">
            <p>{review.text} - {review.rating}/5</p>
            <p>By: {review.user.name}</p>
          </div>
        ))}
        {user && (
          <form onSubmit={handleReview} className="mt-4">
            <textarea
              placeholder="Write your review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border p-2 rounded mt-2"
            >
              {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button type="submit" className="bg-blue-600 text-white p-2 rounded mt-2">Submit Review</button>
          </form>
        )}
      </div>
    </div>
  );
};

const ProviderDashboard = ({ user }) => {
  const [services, setServices] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('https://local-service-finder-backend.onrender.com/api/services/provider', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://local-service-finder-backend.onrender.com/api/services', {
        title,
        category,
        location,
        price: Number(price)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setServices([...services, response.data]);
      setTitle('');
      setCategory('');
      setLocation('');
      setPrice('');
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold">Provider Dashboard</h2>
      <form onSubmit={handleAddService} className="bg-white p-6 rounded shadow mb-6">
        <input
          type="text"
          placeholder="Service Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        >
          <option value="">Select Category</option>
          {['Plumber', 'Electrician', 'Tutor', 'Carpenter', 'Cleaner'].map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />
        <input
          type="number"
          placeholder="Price per hour"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Add Service</button>
      </form>
      <h3 className="text-xl font-bold">Your Services</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service._id} className="bg-white p-4 rounded shadow">
            <h4 className="text-lg font-bold">{service.title}</h4>
            <p>Category: {service.category}</p>
            <p>Location: {service.location}</p>
            <p>Price: ₹{service.price}/hr</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('en');

  const translations = {
    en: {
      title: 'Local Service Finder',
      search: 'Search Services',
      searchPlaceholder: 'Search services...',
      category: 'All Categories',
      location: 'Location',
      book: 'Book Now',
      welcome: 'Welcome'
    },
    hi: {
      title: 'लोकल सर्विस फाइंडर',
      search: 'सेवाएँ खोजें',
      searchPlaceholder: 'सेवाएँ खोजें...',
      category: 'सभी श्रेणियाँ',
      location: 'स्थान',
      book: 'अभी बुक करें',
      welcome: 'स्वागत'
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('https://local-service-finder-backend.onrender.com/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      }).then((response) => setUser(response.data)).catch(() => localStorage.removeItem('token'));
    }
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('https://local-service-finder-backend.onrender.com/api/services', {
        params: { search: searchQuery, category, location }
      });
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    fetchServices();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between">
            <Link to="/" className="text-2xl font-bold">{translations[language].title}</Link>
            <div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-blue-600 text-white border-none mr-4"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </select>
              {user ? (
                <>
                  <span>{translations[language].welcome}, {user.name}</span>
                  <Link to={user.role === 'provider' ? '/provider' : '/'} className="px-4">Dashboard</Link>
                  <button onClick={handleLogout} className="px-4">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4">Login</Link>
                  <Link to="/signup" className="px-4">Signup</Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/service/:id" element={<ServiceDetails user={user} />} />
          <Route path="/provider" element={<ProviderDashboard user={user} />} />
          <Route path="/" element={
            <div className="container mx-auto p-4">
              <div className="bg-white p-6 rounded shadow mb-6">
                <h2 className="text-xl font-bold mb-4">{translations[language].search}</h2>
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder={translations[language].searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border p-2 rounded flex-1"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border p-2 rounded"
                  >
                    <option value="">{translations[language].category}</option>
                    {['Plumber', 'Electrician', 'Tutor', 'Carpenter', 'Cleaner'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder={translations[language].location}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border p-2 rounded"
                  />
                  <button type="submit" className="bg-blue-600 text-white p-2 rounded">Search</button>
                </form>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services.map((service) => (
                  <div key={service._id} className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-bold">{service.title}</h3>
                    <p>Category: {service.category}</p>
                    <p>Location: {service.location}</p>
                    <p>Price: ₹{service.price}/hr</p>
                    <p>Provider: {service.provider.name}</p>
                    <Link to={`/service/${service._id}`} className="mt-2 bg-green-600 text-white p-2 rounded inline-block">
                      {translations[language].book}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;