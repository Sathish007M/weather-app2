import React, { useState, useEffect, useMemo } from 'react';
import CityTable from './CityTable';
import SearchBox from './SearchBox';
import './App.css';

// API Key and Base URL configuration
const API_KEY = "9dc6661520ad9d3b35c9bf8fe944de59"; 
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Function to fetch and process weather data
async function fetchWeather(city) {
    const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.status !== 200) {
            if (response.status === 401) {
                return { error: 'API key unauthorized. Please wait for activation or verify your key.' };
            }
            return { error: data.message || 'City not found. Please check the spelling.' };
        }

        return {
            name: data.name,
            temp: Math.round(data.main.temp),
            condition: data.weather[0].description,
            humidity: data.main.humidity,
            wind: data.wind.speed
        };
    } catch (error) {
        console.error("Fetch failed:", error);
        return { error: 'Could not connect to the weather service.' };
    }
}

function App() {
    // Allowed cities
    const predefinedCities = useMemo(() => (
        ['Delhi', 'Mumbai', 'Bangalore', 'Chennai']
    ), []);

    const [tableWeather, setTableWeather] = useState([]);
    const [cityInput, setCityInput] = useState('');
    const [searchResult, setSearchResult] = useState({ data: null, error: null, loading: false });

    // Fetch weather for the predefined cities on mount
    useEffect(() => {
        const fetchData = async () => {
            const results = [];
            let hasError = false;

            for (const city of predefinedCities) {
                const data = await fetchWeather(city);
                if (data.error) {
                    hasError = true;
                    results.push({ name: city, temp: null, condition: data.error, humidity: null, wind: null });
                } else {
                    results.push({ name: city, ...data });
                }
            }

            setTableWeather(results);

            if (hasError) {
                console.warn("Some cities failed to fetch. Check API key or city names.");
            }
        };

        fetchData();
    }, [predefinedCities]);

    // Handle search
    const handleSearch = async () => {
        const city = cityInput.trim();

        if (!city) {
            setSearchResult({ data: null, error: 'Please enter a city name.', loading: false });
            return;
        }

        // Check if the city is in predefined list (case-insensitive)
        const matchedCity = predefinedCities.find(
            c => c.toLowerCase() === city.toLowerCase()
        );

        if (!matchedCity) {
            setSearchResult({ data: null, error: 'Search result was not found in the above list.', loading: false });
            return;
        }

        setSearchResult({ data: null, error: null, loading: true });
        const data = await fetchWeather(matchedCity);

        if (data.error) {
            setSearchResult({ data: null, error: data.error, loading: false });
        } else {
            setSearchResult({ data: data, error: null, loading: false });
        }
    };

    return (
        <div className="weather-dashboard">
            <header>
                <h1>Weather App Dashboard</h1>
            </header>

            <CityTable weatherData={tableWeather} />

            <SearchBox 
                city={cityInput}
                setCity={setCityInput}
                handleSearch={handleSearch}
                searchResult={searchResult}
            />

            <footer>
                <p>&copy; 2024 Weather App Assignment</p>
            </footer>
        </div>
    );
}

export default App;
