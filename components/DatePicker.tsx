'use client';

import { useState } from 'react';

interface DatePickerProps {
  onSelect: (date: string) => void;
}

export default function DatePicker({ onSelect }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date) => {
    const days = ['Sekmadienis', 'Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis'];
    const months = ['Sausio', 'Vasario', 'Kovo', 'Balandžio', 'Gegužės', 'Birželio', 'Liepos', 'Rugpjūčio', 'Rugsėjo', 'Spalio', 'Lapkričio', 'Gruodžio'];
    
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
    };
  };

  const handleSelect = () => {
    if (selectedDate) {
      onSelect(selectedDate);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-2">Pasirink datą 📅</h2>
        <p className="text-gray-400 text-sm md:text-base">Kurią dieną norite valgyti?</p>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex md:grid md:grid-cols-4 lg:grid-cols-7 gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {dates.map((date, index) => {
          const formatted = formatDate(date);
          const display = formatDisplayDate(date);
          const isToday = index === 0;
          const isSelected = selectedDate === formatted;

          return (
            <button
              key={formatted}
              onClick={() => setSelectedDate(formatted)}
              className={`flex-shrink-0 w-24 md:w-auto p-4 rounded-xl transition-all active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white scale-105 shadow-lg'
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
            >
              <div className="text-xs opacity-70 truncate">{display.day}</div>
              <div className="text-3xl font-bold my-1">{display.date}</div>
              <div className="text-sm">{display.month}</div>
              {isToday && (
                <div className="text-xs mt-1 bg-white/20 rounded px-2 py-0.5">
                  Šiandien
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom date input */}
      <div className="flex justify-center items-center gap-4">
        <span className="text-gray-400 text-sm">arba</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 outline-none text-base"
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSelect}
          disabled={!selectedDate}
          className={`w-full md:w-auto px-8 py-4 rounded-xl text-lg font-bold transition-all active:scale-95 ${
            selectedDate
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-105 shadow-lg'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          Tęsti →
        </button>
      </div>
    </div>
  );
}
