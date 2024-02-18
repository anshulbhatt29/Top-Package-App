// SearchRepositories.js
import React, { useState, useEffect} from "react";
import axios from "axios";

const SearchRepositories = ({ toggleTopPackages }) => {
  const [keyword, setKeyword] = useState("");
  const [repositories, setRepositories] = useState([]);
  const [idExistsMap, setIdExistsMap] = useState({});
  const [Import, setImport] = useState(false);


  useEffect(() => {
    const fetchIdsFromBackend = async () => {
        try {
            const response = await axios.get("http://localhost:5000/all-ids");
            const idMap = {};
            response.data.forEach(item => {
                idMap[item.Id] = true;
            });
            setIdExistsMap(idMap);
        } catch (error) {
            console.error("Error fetching IDs from backend:", error);
        }
    };

    fetchIdsFromBackend();
}, [Import]);


  const isIdPresent = async (id) => {
    const idExistsResponse = await axios.get(
      `http://localhost:5000/check-id/${id}`
    );
    return idExistsResponse.data.exists;
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `https://api.github.com/search/repositories?q=${keyword}`
      );
      console.log(response);
      setRepositories(response.data.items);
      //   console.log(response);
    } catch (error) {
      console.error("Error searching repositories:", error);
    }
  };

  const handleImport = async (owner, repo, id) => {
    try {
      const idExists = await isIdPresent(id);
      if (!idExists) {
        const response = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/contents/package.json`
        );
        const data = response.data;
        if (data.content !== null) {
          const contentBase64 = data.content;
          const decodedContent = atob(contentBase64);
          const packageJson = JSON.parse(decodedContent);
          console.log(packageJson);
          await axios.post("http://localhost:5000/import-package-json", {
            packageJson,
          });
        } else {
          console.log("No content found in the response.");
        }
        await axios.post("http://localhost:5000/save-id", { id });
        setImport((preImport)=>!preImport);
      }
     
    } catch (error) {
      console.error("Error importing repository:", error);
    }
  };

  return (
    <div>
    <h1>Search Your Repositories</h1>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <button onClick={toggleTopPackages}>Top Ten Packages</button>
      <ul>
        {repositories.map((repository) => (
          <li
            key={repository.id}
            style={{
              color: idExistsMap[repository.id] ? "green" : "black", 
            }}
          >
            {repository.full_name}, Forks: {repository.forks}, Stars:{" "}
            {repository.stargazers_count}
            <button
              onClick={() =>
                handleImport(
                  repository.owner.login,
                  repository.name,
                  repository.id
                )
              }
            >
              Import
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchRepositories;
