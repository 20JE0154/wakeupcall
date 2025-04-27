const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // For hitting websites every 10 minutes

const app = express();
const port = 3000;

// Serve index.html
app.use(express.static(path.join(__dirname)));

// Middleware for parsing JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 👈 ADD THIS

// Get the links from the JSON file
function getLinks() {
  try {
    const data = fs.readFileSync('links.json');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Save the links to the JSON file
function saveLinks(links) {
  fs.writeFileSync('links.json', JSON.stringify(links, null, 2));
}

// Route to display the links
app.get('/list', (req, res) => {
  const links = getLinks();
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Monitored Websites | Wake Up Call</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Inter', sans-serif;
          background-color: #f4f7fb;
          color: #333;
          line-height: 1.6;
        }
        
        header {
          background: #0b3d91;
          color: white;
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          flex-wrap: wrap;
        }
        
        .header-left {
          position: absolute;
          left: 40px;
        }
        
        .header-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
        }
        
        .header-title {
          font-size: 20px;
          color: white;
          font-weight: 400;
        }
        
        header h1 {
          font-size: 28px;
          color: #ffcb05;
          text-shadow: 1px 1px 2px #333;
        }
        
        nav {
          display: flex;
          gap: 20px;
          margin-left: auto;
        }
        
        nav a {
          color: white;
          text-decoration: none;
          font-weight: 500;
        }
        
        .container {
          max-width: 800px;
          margin: 40px auto;
          padding: 0 20px;
        }
        
        h2 {
          color: #0b3d91;
          margin-bottom: 30px;
          text-align: center;
        }
        
        .links-list {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          padding: 30px;
          margin-bottom: 30px;
        }
        
        .link-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #eee;
        }
        
        .link-item:last-child {
          border-bottom: none;
        }
        
        .link-url {
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
          word-break: break-all;
        }
        
        .link-url:hover {
          text-decoration: underline;
        }
        
        .delete-btn {
          background: #ff4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.3s;
        }
        
        .delete-btn:hover {
          background: #cc0000;
        }
        
        .back-btn {
          display: inline-block;
          background: #0b3d91;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: background 0.3s;
        }
        
        .back-btn:hover {
          background: #072a6b;
        }
        
        .empty-state {
          text-align: center;
          color: #666;
          padding: 40px 0;
        }
        
        footer {
          background: #0b3d91;
          color: white;
          text-align: center;
          padding: 20px 0;
          margin-top: 50px;
        }
        
        @media (max-width: 600px) {
          .link-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .delete-btn {
            align-self: flex-end;
          }
        }
      </style>
    </head>
    <body>
      <header>
        <div class="header-left">
          <div class="header-title">Wake Up Call 🚀</div>
        </div>
        <div class="header-center">
          <h1>CodexIIT</h1>
        </div>
        <nav>
          <a href="/#features">Features</a>
          <a href="/#contact">Contact</a>
          <a href="/">Home</a>
        </nav>
      </header>
      
      <div class="container">
        <h2>Currently Monitored Websites</h2>
        
        <div class="links-list">
          ${links.length > 0 ? `
            <ul>
              ${links.map(link => `
                <li class="link-item">
                  <a href="${link.url}" target="_blank" class="link-url">${link.url}</a>
                  <form action="/delete" method="POST" style="display:inline;">
                    <input type="hidden" name="url" value="${link.url}">
                    <button type="submit" class="delete-btn">Delete</button>
                  </form>
                </li>
              `).join('')}
            </ul>
          ` : `
            <div class="empty-state">
              <p>No websites are currently being monitored.</p>
              <p>Add some from the home page to get started!</p>
            </div>
          `}
        </div>
        
        <div style="text-align: center;">
          <a href="/" class="back-btn">← Back to Home</a>
        </div>
      </div>
      
      <footer>
        <p>📬 Contact: <a href="mailto:codexiit.business@gmail.com" style="color: #ffcb05;">codexiit.business@gmail.com</a></p>
        <p>© 2025 Wake Up Call</p>
      </footer>
    </body>
    </html>
  `);
});

// Route to add a link
app.post('/add', (req, res) => {
  const { url } = req.body;
  if (!url || !url.trim()) {
    return res.status(400).send({ message: 'URL cannot be empty', status: 'error' });
  }

  const links = getLinks();
  links.push({ url });

  saveLinks(links);

  res.status(201).send({
    message: `Link ${url} added successfully!`,
    status: 'success'
  });
});

// Route to delete a link
app.post('/delete', (req, res) => {
  const { url } = req.body;
  let links = getLinks();

  // Filter out the link to be deleted
  links = links.filter(link => link.url !== url);

  // Save the updated list to links.json
  saveLinks(links);

  res.redirect('/list');
});

// Function to hit websites every 10 minutes
function pingWebsites() {
  const links = getLinks();

  links.forEach(link => {
    fetch(link.url)
      .then(response => {
        console.log(`Pinged ${link.url}: ${response.status}`);
      })
      .catch(error => {
        console.error(`Failed to ping ${link.url}: ${error.message}`);
      });
  });
}

// Ping websites every 10 minutes (600000 milliseconds)
setInterval(pingWebsites, 600000);

// Serve the index.html on the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
