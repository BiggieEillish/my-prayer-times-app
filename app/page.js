"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function HomePage() {
  const [prayerData, setPrayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [currentPrayer, setCurrentPrayer] = useState(null);

  const today = new Date();
  const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

  useEffect(() => {
    async function fetchPrayerData() {
      try {
        const storedPrayerData = JSON.parse(localStorage.getItem('monthlyPrayerTimes'));
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const todayDay = today.getDate();

        console.log("Stored Prayer Data:", storedPrayerData);

        let monthlyPrayerTimes;

        if (storedPrayerData && storedPrayerData.month === currentMonth && storedPrayerData.year === currentYear) {
          monthlyPrayerTimes = storedPrayerData.prayerTimes;
        } else {
          console.log("Starting to fetch prayer data");
          const response = await axios.get('https://api.waktusolat.app/v2/solat/SGR01');
          console.log("API Response:", response.data);

          monthlyPrayerTimes = response.data.prayers;

          if (!Array.isArray(monthlyPrayerTimes)) {
            throw new Error("API response is not an array of prayer times");
          }

          localStorage.setItem('monthlyPrayerTimes', JSON.stringify({
            month: currentMonth,
            year: currentYear,
            prayerTimes: monthlyPrayerTimes,
          }));
        }

        if (Array.isArray(monthlyPrayerTimes)) {
          const todayPrayerData = monthlyPrayerTimes.find(item => item.day === todayDay);

          if (todayPrayerData) {
            setPrayerData(todayPrayerData);
            console.log("Today's Prayer Data:", todayPrayerData);
          } else {
            console.error("Today's day:", todayDay);
            console.error("Available days in API response:", monthlyPrayerTimes.map(item => item.day));
            throw new Error("Today's prayer times not found");
          }
        } else {
          throw new Error("Stored data is not in the expected format");
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching prayer data:', error);
        setError("Unable to fetch prayer times. Please try again later.");
        setLoading(false);
        localStorage.removeItem('monthlyPrayerTimes');
      }
    }

    fetchPrayerData();
  }, []);

  const formatTime = (timestamp) => {
    if (typeof timestamp !== 'number') {
      console.error("Invalid timestamp:", timestamp);
      return "N/A";
    }

    const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  useEffect(() => {
    if (prayerData) {
      const prayerTimes = [
        { name: 'Fajr', time: new Date(prayerData.fajr * 1000) },
        { name: 'Dhuhr', time: new Date(prayerData.dhuhr * 1000) },
        { name: 'Asr', time: new Date(prayerData.asr * 1000) },
        { name: 'Maghrib', time: new Date(prayerData.maghrib * 1000) },
        { name: 'Isha', time: new Date(prayerData.isha * 1000) },
      ];

      const updateCountdown = () => {
        const now = new Date();
        let nextPrayer = null;
        let currentPrayerName = "No current prayer";

        for (let i = 0; i < prayerTimes.length; i++) {
          const { name, time } = prayerTimes[i];

          if (now < time) {
            nextPrayer = { name, time };
            currentPrayerName = i > 0 ? prayerTimes[i - 1].name : "No current prayer";
            break;
          }
        }

        if (!nextPrayer) {
          const fajrTime = new Date(prayerData.fajr * 1000);
          fajrTime.setDate(fajrTime.getDate() + 1);
          nextPrayer = { name: 'Fajr', time: fajrTime };
          currentPrayerName = prayerTimes[prayerTimes.length - 1].name;
        }

        if (nextPrayer && nextPrayer.time) {
          const timeDifference = nextPrayer.time.getTime() - now.getTime();
          const hours = Math.floor((timeDifference) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

          setCountdown(`${hours}h ${minutes}m ${seconds}s until ${nextPrayer.name}`);
          setCurrentPrayer(currentPrayerName);
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [prayerData]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4 flex flex-col justify-between min-h-[90vh] bg-gray-100">
      <header className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-md text-center shadow-lg">
        <div className="flex items-center justify-center space-x-3">
          <img src="/10073969.png" alt="Mosque Icon" width={32} height={32} className="inline-block" />
          <h1 className="text-2xl font-bold">Prayer Times for {formattedDate}</h1>
          <img src="/prayermat.png" alt="Prayer Mat Icon" width={32} height={32} className="inline-block" />
        </div>
      </header>

      <main className="flex-grow my-6 space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-lg border border-blue-200">
          <p className="text-lg font-semibold text-blue-700 mb-2 text-center">Current Prayer: {currentPrayer || "Loading..."}</p>
          <p className="text-2xl font-bold text-blue-800 text-center">{countdown || "Calculating..."}</p>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Prayer Times</h2>
          <ul className="text-lg space-y-3">
            {prayerData && [
              { name: 'Fajr', time: formatTime(prayerData.fajr) },
              { name: 'Dhuhr', time: formatTime(prayerData.dhuhr) },
              { name: 'Asr', time: formatTime(prayerData.asr) },
              { name: 'Maghrib', time: formatTime(prayerData.maghrib) },
              { name: 'Isha', time: formatTime(prayerData.isha) },
            ].map((prayer, index) => (
              <li key={index} className="my-2 font-semibold text-center text-gray-700">
                <span>{prayer.name}:</span> {prayer.time}
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer className="bg-gray-900 text-white text-center p-4 rounded-md shadow-md mt-6">
        &copy; {new Date().getFullYear()} Susuntech Solutions Sdn Bhd
      </footer>
    </div>
  );
}
