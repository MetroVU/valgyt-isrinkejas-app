'use client';

import { SessionData } from '@/lib/data';

interface PersonSelectorProps {
  onSelect: (person: 'person1' | 'person2', forceEdit?: boolean) => void;
  session: SessionData | null;
  selectedDate: string;
}

export default function PersonSelector({ onSelect, session, selectedDate }: PersonSelectorProps) {
  const person1Submitted = session?.person1?.submitted;
  const person2Submitted = session?.person2?.submitted;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['sausio', 'vasario', 'kovo', 'balandžio', 'gegužės', 'birželio', 'liepos', 'rugpjūčio', 'rugsėjo', 'spalio', 'lapkričio', 'gruodžio'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Kas esi? 👥</h2>
        <p className="text-gray-400">
          Pasirinkimas datai: <span className="text-purple-400 font-semibold">{formatDate(selectedDate)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Person 1 */}
        <div className="relative">
          <button
            onClick={() => onSelect('person1')}
            className={`w-full relative p-8 rounded-2xl transition-all hover:scale-105 ${
              person1Submitted
                ? 'bg-gradient-to-br from-green-600 to-emerald-600'
                : 'bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
            }`}
          >
            <div className="text-6xl mb-4">👨</div>
            <div className="text-2xl font-bold">Aš</div>
            <div className="text-sm opacity-80 mt-2">
              {person1Submitted ? '✓ Jau pasirinko' : 'Dar nepasirinko'}
            </div>
            {person1Submitted && (
              <div className="absolute top-4 right-4 text-2xl">✓</div>
            )}
          </button>
          {person1Submitted && (
            <button
              onClick={() => onSelect('person1', true)}
              className="mt-2 w-full py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-all text-sm"
            >
              ✏️ Redaguoti pasirinkimus
            </button>
          )}
        </div>

        {/* Person 2 */}
        <div className="relative">
          <button
            onClick={() => onSelect('person2')}
            className={`w-full relative p-8 rounded-2xl transition-all hover:scale-105 ${
              person2Submitted
                ? 'bg-gradient-to-br from-green-600 to-emerald-600'
                : 'bg-gradient-to-br from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500'
            }`}
          >
            <div className="text-6xl mb-4">👩</div>
            <div className="text-2xl font-bold">Ji</div>
            <div className="text-sm opacity-80 mt-2">
              {person2Submitted ? '✓ Jau pasirinko' : 'Dar nepasirinko'}
            </div>
            {person2Submitted && (
              <div className="absolute top-4 right-4 text-2xl">✓</div>
            )}
          </button>
          {person2Submitted && (
            <button
              onClick={() => onSelect('person2', true)}
              className="mt-2 w-full py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-all text-sm"
            >
              ✏️ Redaguoti pasirinkimus
            </button>
          )}
        </div>
      </div>

      {(person1Submitted || person2Submitted) && (
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            {person1Submitted && person2Submitted
              ? 'Abu jau pasirinko! Paspausk bet kurį, kad pamatytum rezultatus, arba redaguok pasirinkimus.'
              : 'Vienas žmogus jau pasirinko. Kitas dar turi pasirinkti.'}
          </p>
        </div>
      )}
    </div>
  );
}
