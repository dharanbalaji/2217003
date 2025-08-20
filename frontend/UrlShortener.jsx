import React, { useState } from "react";

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const sources = ["Email", "WhatsApp", "Direct", "Facebook"];
const locations = ["India", "USA", "UK", "Canada"];

export function UrlShortener() {
  const [inputs, setInputs] = useState([
    { url: "", validity: "", shortcode: "" },
  ]);
  const [results, setResults] = useState([]);
  const [statsData, setStatsData] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [errors, setErrors] = useState([]);

  // Handle input change for each URL group
  const handleInputChange = (idx, field, value) => {
    setInputs((prev) =>
      prev.map((input, i) =>
        i === idx ? { ...input, [field]: value } : input
      )
    );
  };

  // Add new URL input group (max 5)
  const handleAddInput = () => {
    if (inputs.length < 5) {
      setInputs([...inputs, { url: "", validity: "", shortcode: "" }]);
    }
  };

  // Remove a URL input group
  const handleRemoveInput = (idx) => {
    setInputs(inputs.filter((_, i) => i !== idx));
  };

  // Shorten URLs
  const handleShorten = () => {
    setErrors([]);
    setResults([]);
    setShowStats(false);

    let newErrors = [];
    let newResults = [];
    let newStats = [];

    inputs.forEach((input, idx) => {
      let errs = [];
      if (!input.url.trim()) return; // skip empty
      if (!isValidURL(input.url.trim()))
        errs.push(`Row ${idx + 1}: Please enter a valid URL.`);
      if (
        input.validity &&
        (!Number.isInteger(Number(input.validity)) ||
          Number(input.validity) <= 0)
      ) {
        errs.push(`Row ${idx + 1}: Validity must be a positive integer.`);
      }
      if (errs.length) {
        newErrors.push(...errs);
        return;
      }
      const shortUrl =
        "https://short.ly/" +
        (input.shortcode || Math.random().toString(36).substr(2, 6));
      const created = new Date().toLocaleString();
      const expiry = input.validity
        ? new Date(Date.now() + Number(input.validity) * 60000).toLocaleString()
        : "Never";
      newResults.push({
        url: input.url,
        shortUrl,
        expiry,
      });
      newStats.push({
        shortUrl,
        originalUrl: input.url,
        created,
        expiry,
        clickCount: 0,
        clicks: [],
      });
    });

    setErrors(newErrors);
    setResults(newResults);
    setStatsData((prev) => [...prev, ...newStats]);
  };

  // Simulate click tracking (for demo purposes)
  function simulateClick(shortUrl) {
    setStatsData((prevStats) =>
      prevStats.map((stat) => {
        if (stat.shortUrl === shortUrl) {
          return {
            ...stat,
            clickCount: stat.clickCount + 1,
            clicks: [
              ...stat.clicks,
              {
                timestamp: new Date().toLocaleString(),
                source: sources[Math.floor(Math.random() * sources.length)],
                location: locations[Math.floor(Math.random() * locations.length)],
              },
            ],
          };
        }
        return stat;
      })
    );
  }

  // Show stats for all shortened URLs in session
  const handleShowStats = () => {
    statsData.forEach((stat) => {
      if (stat.clickCount === 0) {
        simulateClick(stat.shortUrl);
        simulateClick(stat.shortUrl);
      }
    });
    setShowStats(true);
  };

  return (
    <div>
      <style>{`
        body { font-family: Arial, sans-serif; margin: 30px; background-color: #f4f4f4; }
        .url-group { margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; background: #fff; }
        label { display: block; margin-bottom: 5px; }
        input { margin-bottom: 10px; width: 100%; padding: 6px; }
        h1, h2 { text-align: center; }
        .submit-btn, .stats-btn, .add-btn, .remove-btn { display: block; margin: 10px auto; padding: 10px 30px; }
        .add-btn { background: #4caf50; color: #fff; border: none; border-radius: 4px; }
        .remove-btn { background: #f44336; color: #fff; border: none; border-radius: 4px; padding: 5px 15px; margin-top: 0; }
        .url-stats { background: #fff; margin-bottom: 30px; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px #ddd; }
        .click-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .click-table th, .click-table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        .click-table th { background: #eee; }
      `}</style>
      <h1>URL SHORTENER</h1>
      <h2>SHORTEN UP TO 5 URLS AT ONCE</h2>
      {inputs.map((input, idx) => (
        <div className="url-group" key={idx}>
          <label htmlFor={`url${idx}`}>Original URL:</label>
          <input
            type="text"
            id={`url${idx}`}
            value={input.url}
            onChange={(e) => handleInputChange(idx, "url", e.target.value)}
            placeholder="Enter your long URL here"
          />

          <label htmlFor={`validity${idx}`}>Validity Period (minutes):</label>
          <input
            type="number"
            id={`validity${idx}`}
            value={input.validity}
            onChange={(e) => handleInputChange(idx, "validity", e.target.value)}
            placeholder="Optional"
          />

          <label htmlFor={`shortcode${idx}`}>Preferred Shortcode:</label>
          <input
            type="text"
            id={`shortcode${idx}`}
            value={input.shortcode}
            onChange={(e) => handleInputChange(idx, "shortcode", e.target.value)}
            placeholder="Optional"
          />
          {inputs.length > 1 && (
            <button
              className="remove-btn"
              type="button"
              onClick={() => handleRemoveInput(idx)}
            >
              Remove
            </button>
          )}
        </div>
      ))}
      {inputs.length < 5 && (
        <button className="add-btn" type="button" onClick={handleAddInput}>
          + Add Another URL
        </button>
      )}
      <button className="submit-btn" onClick={handleShorten}>
        Shorten URLs
      </button>
      <button className="stats-btn" onClick={handleShowStats}>
        Show Stats
      </button>

      <div id="result">
        {errors.length > 0 && (
          <div style={{ color: "red", marginBottom: 10 }}>
            {errors.map((err, i) => (
              <div key={i} dangerouslySetInnerHTML={{ __html: err }} />
            ))}
          </div>
        )}
        {results.length > 0 &&
          results.map((result, idx) => (
            <div
              key={idx}
              style={{
                marginTop: 20,
                padding: 10,
                border: "1px solid #ccc",
                borderRadius: 6,
                background: "#fff",
              }}
            >
              <strong>Original URL:</strong> {result.url}
              <br />
              <strong>Shortened URL:</strong>{" "}
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {result.shortUrl}
              </a>
              <br />
              <strong>Expiry:</strong> {result.expiry}
            </div>
          ))}
      </div>
      <div id="stats">
        {showStats &&
          (statsData.length === 0 ? (
            <div style={{ color: "red" }}>No URLs shortened yet.</div>
          ) : (
            statsData.map((url) => (
              <div className="url-stats" key={url.shortUrl}>
                <strong>Shortened URL:</strong>{" "}
                <a
                  href={url.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {url.shortUrl}
                </a>
                <br />
                <strong>Original URL:</strong> {url.originalUrl}
                <br />
                <strong>Created:</strong> {url.created}
                <br />
                <strong>Expiry:</strong> {url.expiry}
                <br />
                <strong>Total Clicks:</strong> {url.clickCount}
                <h4>Click Details:</h4>
                <table className="click-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Source</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {url.clicks.map((click, idx) => (
                      <tr key={idx}>
                        <td>{click.timestamp}</td>
                        <td>{click.source}</td>
                        <td>{click.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          ))}
      </div>
    </div>
  );
}