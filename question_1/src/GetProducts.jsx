import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GetProducts = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    company: '',
    rating: '',
    minPrice: '',
    maxPrice: '',
    available: false,
  });
  const [sort, setSort] = useState('price');
  const [loading, setLoading] = useState(true);

  
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${filters.company}/${filters.category}`, {
          params: {
            top: 10, // Adjust as needed
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
           
          },
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
      setLoading(false);
    };

   


  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-4">All Products</h1>

        <div className="mb-4">
          <label className="block text-lg font-medium">Filters</label>
          <input
            type="text"
            name="category"
            placeholder="Category"
            className="border border-gray-300 p-2 rounded-lg w-full"
            value={filters.category}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="company"
            placeholder="Company"
            className="border border-gray-300 p-2 rounded-lg w-full mt-2"
            value={filters.company}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            className="border border-gray-300 p-2 rounded-lg w-full mt-2"
            value={filters.minPrice}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            className="border border-gray-300 p-2 rounded-lg w-full mt-2"
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
          <select
            name="rating"
            className="border border-gray-300 p-2 rounded-lg w-full mt-2"
            value={filters.rating}
            onChange={handleFilterChange}
          >
            <option value="">Rating</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <label className="block mt-2">
            <input
              type="checkbox"
              name="available"
              className="mr-2"
              checked={filters.available}
              onChange={handleFilterChange}
            />
            Available
          </label>
          <select
            className="border border-gray-300 p-2 rounded-lg w-full mt-2"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="price">Sort by Price</option>
            <option value="rating">Sort by Rating</option>
            <option value="discount">Sort by Discount</option>
          </select>
          <button  className=" bg-blue-400 w-full p-2 mt-2"onClick={()=>{ fetchProducts()}}>click</button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white border rounded-lg shadow-md p-4">
               {console.log(product)}
                <h2 className="text-xl font-semibold">{product.productName}</h2>
                <p className="text-gray-700">{product.company}</p>
                <p className="text-gray-700">{product.category}</p>
                <p className="text-gray-900 font-bold">${product.price}</p>
                <p className="text-gray-600">Rating: {product.rating}</p>
                <p className="text-gray-600">Discount: {product.discount}%</p>
                <p className="text-gray-600">{product.available ? 'In Stock' : 'Out of Stock'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetProducts;
–