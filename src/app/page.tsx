"use client";
import React, {
  useState,
  useEffect,
  ChangeEventHandler,
  MouseEventHandler,
} from "react";
import "./home.scss";
import { MagnifyingGlass } from "react-loader-spinner";
import { CiSearch } from "react-icons/ci";

import { BsClouds, BsFillSunriseFill, BsFillSunsetFill } from "react-icons/bs";
import { LiaTemperatureLowSolid } from "react-icons/lia";
import { WiHumidity } from "react-icons/wi";
import { MdOutlineVisibility, MdWindPower } from "react-icons/md";
import { TiWeatherWindy } from "react-icons/ti";
import { FaWind } from "react-icons/fa6";
import { TbFaceIdError } from "react-icons/tb";

interface Location {
  latitude: number | null;
  longitude: number | null;
}

interface Error {
  message: string;
}

interface WeatherData {
  coord: {
    lat: number;
    lon: number;
  };
  weather: [
    {
      main: string;
      description: string;
    }
  ];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level: number;
    grnd_level: number;
  };
  name: string;
  wind: {
    deg: number;
    speed: number;
  };
  visibility: number;
  clouds: {
    all: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
  };
}

const getLocationAsync = () => {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

const apiKey: string = "4d502482481442794edb3e852afae396";

const Home: React.FC = () => {
  const [location, setLocation] = useState<Location>({
    latitude: null,
    longitude: null,
  });
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputLocation, setInputLocation] = useState<string>("");
  const [fetchData, setFetchData] = useState<WeatherData | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState("");

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Month is zero-indexed
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Formatting date components to ensure they have two digits
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedDay = day < 10 ? `0${day}` : day;

    // Formatting time components to ensure they have two digits
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    // Constructing the date and time strings
    const currentDate = `${year}-${formattedMonth}-${formattedDay}`;
    const currentTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    const currentDateTimeString = `${currentDate} ${currentTime}`;

    return currentDateTimeString;
  };

  const fetchWeatherdata: () => void = async () => {
    setLoading(true);
    let url;
    if (inputLocation.trim() !== "") {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${inputLocation}&appid=${apiKey}`;
    } else if (location.latitude !== null && location.longitude !== null) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}`;
    }
    if (url) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setFetchData(data);
          setError(null);
        } else {
          setError({ message: response.statusText });
        }
      } catch (error) {
        setError({ message: "An error occurred while fetching weather data." });
      } finally {
        setLoading(false);
      }
    }
  };

  // for fetching the location by default -> as soon as the app will load this will work
  const getLocation: () => void = () => {
    setLoading(true);
    getLocationAsync()
      .then((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
      })
      .catch((error) => {
        setError({ message: error.message });
        setLocation({ latitude: null, longitude: null });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderLoader: () => React.JSX.Element = () => {
    return (
      <div>
        <MagnifyingGlass
          visible={true}
          height="80"
          width="80"
          ariaLabel="magnifying-glass-loading"
          wrapperStyle={{}}
          wrapperClass="magnifying-glass-wrapper"
          glassColor="#c0efff"
          color="black"
        />
      </div>
    );
  };

  const handleOnChangeLocation: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setInputLocation(event.target.value);
  };

  const renderInput: () => React.JSX.Element = () => {
    return (
      <input
        placeholder={fetchData?.name ? fetchData.name : "Enter your city"}
        value={inputLocation}
        onChange={handleOnChangeLocation}
        className="bg-transparent pl-2 border-none outline-none"
      />
    );
  };

  const handleInputLocation: MouseEventHandler<HTMLButtonElement> = () => {
    fetchWeatherdata();
  };

  // for automatically loading the location of the user
  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    // Fetch weather data whenever location changes
    if (location.latitude !== null || location.longitude !== null) {
      fetchWeatherdata();
    }
  }, [location]);

  // Update the current date and time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime());
    }, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const renderSearchAndTimebar: () => React.JSX.Element = () => {
    return (
      <div className="flex justify-center md:justify-between aline-center items-center">
        <div className="bg-white h-8 w-60 border-none outline-none flex justify-between items-center pr-0.5">
          {renderInput()}
          <button
            onClick={handleInputLocation}
            className="bg-gradient-to-t from-cyan-500 to-blue-800 h-7 w-7 flex justify-center items-center"
          >
            <CiSearch size={20} color="white" />
          </button>
        </div>
        <div className="hidden md:block">
          <div className="bg-white h-8 w-40 border-none outline-none flex justify-center items-center pr-0.5  ">
            <p>{currentDateTime}</p>
          </div>
        </div>
      </div>
    );
  };

  const getTemp = (temp: number | undefined) => {
    if (temp) {
      const result = temp - 273.15;
      return parseFloat(result.toFixed(2));
    }
  };

  const getWeatherDetails: () => React.JSX.Element = () => {
    const weatherDetailsArray = [
      {
        id: 1,
        title: "Clouds",
        icon: <BsClouds size={25} />,
        description: `${fetchData?.clouds.all} %`,
      },
      {
        id: 2,
        title: "Weather Type",
        icon: <TiWeatherWindy size={25} />,
        description: `${fetchData?.weather[0].main}`,
      },
      {
        id: 3,
        title: "Feels Like",
        icon: <LiaTemperatureLowSolid size={25} />,
        description: `${getTemp(fetchData?.main.feels_like)}\u00B0C`,
      },
      {
        id: 4,
        title: "Humidity",
        icon: <WiHumidity size={25} />,
        description: `${fetchData?.main.humidity} %`,
      },
      {
        id: 5,
        title: "Visibility",
        icon: <MdOutlineVisibility size={25} />,
        description: `${fetchData?.visibility} m`,
      },
      {
        id: 6,
        title: "Wind Speed",
        icon: <FaWind size={25} />,
        description: `${fetchData?.wind.speed} m/s`,
      },
      {
        id: 7,
        title: "Wind Direction",
        icon: <MdWindPower size={25} />,
        description: `${fetchData?.wind.deg}\u00B0`,
      },
    ];

    return (
      <ul className="flex justify-center flex-wrap gap-3 mt-10">
        {weatherDetailsArray.map((weather) => (
          <li
            key={weather.id}
            className="text-neutral-700 border border-neutral-100 bg-gray-400 bg-opacity-20 p-2 w-32 flex flex-col justify-center items-center gap-3 hover:scale-105 transition-all"
          >
            <p>{weather.title}</p>
            <span>{weather.icon}</span>
            <p>{weather.description}</p>
          </li>
        ))}
      </ul>
    );
  };

  const renderDisplayData = () => {
    return (
      <div className="text-center">
        <p className="text-2xl text-neutral-700 mb-8">{fetchData?.name}</p>
        <p className="text-7xl md:text-9xl current-weather text-white">
          {getTemp(fetchData?.main.temp)}&deg;C
        </p>
        {getWeatherDetails()}
      </div>
    );
  };

  return (
    <div className="min-h-screen md:h-screen w-screen bg-gradient-to-t from-cyan-500 to-blue-800 p-4 md:p-10">
      <div className="border-2 border-neutral-500 h-full w-full bg-gray-400 bg-opacity-20 pt-10 pb-10">
        {renderSearchAndTimebar()}
        <div className="flex justify-center items-center h-full w-full mt-10">
          {loading && renderLoader()}
          {!loading && !error && fetchData?.coord.lon && renderDisplayData()}
          {!loading && error && (
            <div className="text-white flex justify-center items-center flex-col">
              <TbFaceIdError size={50} />
              <p>Error: {error.message}</p>
              <p>Please search another City</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
