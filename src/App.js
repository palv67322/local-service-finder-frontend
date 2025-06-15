import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  const categories = ['Plumber', 'Electrician', 'Tutor', 'Carpenter', 'Cleaner'];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('https://local-service-finder-backend.onrender.com/api/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get('https://local-service-finder-backend.onrender.com/api/services', {
        params: { search: searchQuery, category, location }
      });
      setServices(response.data);
    } catch (error) {
      console.error('Error searching services:', error);
    }
  };

  const handleBooking = async (serviceId) => {
    if (!user) {
      alert('Please login to book a service');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/bookings', { serviceId, userId: user._id });
      alert('Booking successful!');
    } catch (error) {
      console.error('Error booking service:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between">
          <h1 className="text-2xl font-bold">Local Service Finder</h1>
          <div>
            {user ? (
              <span>Welcome, {user.name}</span>
            ) : (
              <a href="/login" className="px-4">Login/Signup</a>
            )}
          </div>
        </div>
      </nav>
      <div className="container mx-auto p-4">
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Search Services</h2>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border p-2 rounded flex-1"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Location"
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
              <button
                onClick={() => handleBooking(service._id)}
                className="mt-2 bg-green-600 text-white p-2 rounded"
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;