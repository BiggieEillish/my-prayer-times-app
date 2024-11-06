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

        if (storedPrayerData && storedPrayerData.month === currentMonth && storedPrayerData.year === currentYear) {
          setPrayerData(storedPrayerData.prayerTimes);
        } else {
          const response = await axios.get('https://api.waktusolat.app/v2/solat/SGR01');
          const monthlyPrayerTimes = response.data.prayers;
          localStorage.setItem('monthlyPrayerTimes', JSON.stringify({
            month: currentMonth,
            year: currentYear,
            prayerTimes: monthlyPrayerTimes,
          }));
          setPrayerData(monthlyPrayerTimes);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching prayer data:', error);
        setError("Unable to fetch prayer times. Please try again later.");
      }
    }

    fetchPrayerData();
  }, []);

  useEffect(() => {
    if (prayerData) {
      const prayerTimes = [
        { name: 'Fajr', hour: 5, minute: 48 },
        { name: 'Dhuhr', hour: 13, minute: 0 },
        { name: 'Asr', hour: 16, minute: 20 },
        { name: 'Maghrib', hour: 18, minute: 58 },
        { name: 'Isha', hour: 20, minute: 9 },
      ];

      const updateCountdown = () => {
        const now = new Date();
        const currentTime = new Date();
        currentTime.setMilliseconds(0);

        let nextPrayer = null;
        let currentPrayerName = "No current prayer";

        for (let i = 0; i < prayerTimes.length; i++) {
          const { name, hour, minute } = prayerTimes[i];
          const prayerTime = new Date();
          prayerTime.setHours(hour, minute, 0, 0);

          if (currentTime < prayerTime) {
            nextPrayer = { name, time: prayerTime };
            currentPrayerName = i > 0 ? prayerTimes[i - 1].name : "No current prayer";
            break;
          }
        }

        if (!nextPrayer) {
          const fajr = prayerTimes[0];
          const nextFajr = new Date();
          nextFajr.setDate(now.getDate() + 1);
          nextFajr.setHours(fajr.hour, fajr.minute, 0, 0);
          nextPrayer = { name: fajr.name, time: nextFajr };
          currentPrayerName = prayerTimes[prayerTimes.length - 1].name;
        }

        const timeDifference = nextPrayer.time.getTime() - currentTime.getTime();
        if (timeDifference > 0) {
          const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
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
        {/* Current Prayer and Countdown Card */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-lg border border-blue-200">
          <p className="text-lg font-semibold text-blue-700 mb-2 text-center">Current Prayer: {currentPrayer || "Loading..."}</p>
          <p className="text-2xl font-bold text-blue-800 text-center">{countdown || "Calculating..."}</p>
        </div>

        {/* Prayer Times Card */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Prayer Times</h2>
          <ul className="text-lg space-y-3">
            {prayerData && [
              { name: 'Fajr', time: new Date(prayerData.fajr * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) },
              { name: 'Dhuhr', time: new Date(prayerData.dhuhr * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) },
              { name: 'Asr', time: new Date(prayerData.asr * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) },
              { name: 'Maghrib', time: new Date(prayerData.maghrib * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) },
              { name: 'Isha', time: new Date(prayerData.isha * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) },
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
