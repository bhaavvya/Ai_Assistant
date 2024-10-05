


import React, { useState } from 'react';
import { Container, Navbar, Button, Dropdown } from 'react-bootstrap';
import { CssBaseline, createTheme, ThemeProvider } from '@mui/material';
import { TextField, CircularProgress, Typography, Card, CardContent, Box } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');

  // Toggle between light and dark mode
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();

      if (response.ok) {
        setAnswer(data.answer);
        setSources(data.results);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error(err); // Log the error for debugging
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleBackgroundChange = (url) => {
    setBackgroundImage(url);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          minHeight: '100vh',
          
        }}
      >
        <Navbar bg={darkMode ? "dark" : "light"} variant={darkMode ? "dark" : "light"}>
          <Container>
            <Navbar.Brand>AI Assistant</Navbar.Brand>
            <Button
              variant="outline-primary"
              onClick={() => setDarkMode(!darkMode)}
            >
              Toggle {darkMode ? "Light" : "Dark"} Mode
            </Button>

            {/* Dropdown to change background */}
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" id="dropdown-basic" >
                Change Background
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleBackgroundChange('https://i.pinimg.com/originals/1d/26/c5/1d26c5b022c071fb8f1e3ae2f0f65ba9.gif')}>
                  Background 1
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleBackgroundChange('https://cdnb.artstation.com/p/assets/images/images/041/601/775/original/ida-franzen-karlsson-background-animation.gif?1632167232')}>
                  Background 2
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleBackgroundChange('https://cdnb.artstation.com/p/assets/images/images/064/590/817/original/michal-kvac-deserted-metropolis-close-up-process.gif?1688304430')}>
                  Background 3
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Container>
        </Navbar>

        <Container className="py-4">
          <Typography variant="h4" component="h1" gutterBottom>
            Ask your question
          </Typography>

          <Container className="align-self-stretch">
            <Box display="flex" alignItems="center">
              <TextField
                fullWidth
                variant="outlined"
                label="Type your question"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                style={{ marginRight: '10px' }}  // Add margin to create space between the input and button
                InputProps={{
                  style: { color: darkMode ? 'white' : 'black' },  // Set input text color based on dark mode
                }}
                InputLabelProps={{
                  style: { color: darkMode ? 'white' : 'black' },  // Set label color based on dark mode
                }}
              />
              <Button
                variant="outline-primary"
                onClick={handleSearch}
                disabled={loading}
                style={{ minWidth: '100px' }}  // Adjust the button width as needed
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
            </Box>
          </Container>

          {error && (
            <Typography color="error" className="mt-4">
              {error}
            </Typography>
          )}

          {answer && (
            <Card className="my-4">
              <CardContent>
                <Typography variant="h6">Answer</Typography>
                <Typography>{answer}</Typography>
              </CardContent>
            </Card>
          )}

          {sources.length > 0 && (
            <div className="mt-4">
              <Typography variant="h6" gutterBottom>Sources</Typography>
              <Box container spacing={2}>
                {sources.map((source) => (
                  <Box item xs={12} sm={6} md={4} key={source.position} border={'InfoBackground'}>
                    <Card>
                      <CardContent>
                        <Typography variant="body1" component="a" href={source.link} target="_blank" rel="noopener noreferrer">
                          {source.title}
                        </Typography>
                        <Typography variant="body2">{source.snippet}</Typography>
                        {source.date && (
                          <Typography variant="caption" color="textSecondary">{source.date}</Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </div>
          )}
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
