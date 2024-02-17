import './App.css';
import SearchRepositories from './Pages/SearchRepository';
import React, { useState } from 'react'; 
import TopPackages from './Pages/TopPackages';

function App() {
  const [showTopPackages, setShowTopPackages] = useState(false);
  const toggleTopPackages = () => {
    setShowTopPackages(!showTopPackages);
  };
  return (
    <div className="App">
      {
        showTopPackages === false?
    <SearchRepositories toggleTopPackages={toggleTopPackages}/>:<TopPackages toggleTopPackages={toggleTopPackages}/>
      }
    </div>
  );
}

export default App;
