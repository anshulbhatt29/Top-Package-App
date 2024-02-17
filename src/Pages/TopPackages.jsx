// TopPackages.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TopPackages = ({toggleTopPackages}) => {
  const [topPackages, setTopPackages] = useState([]);

  useEffect(() => {
    const fetchTopPackages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/top-ten-dependencies');
        console.log(response);
        setTopPackages(response.data);
      } catch (error) {
        console.error('Error fetching top packages:', error);
      }
    };

    fetchTopPackages();
  }, []);

  return (
    <div>
      <button onClick={toggleTopPackages}>Back</button>
      <h2>Top Packages</h2>
      <ul>
  {topPackages.map((Package, index) => (
    <li key={index}>{Package.Name}</li>
  ))}
</ul>
    </div>
  );
};

export default TopPackages;
