import React, { useEffect, useState } from 'react';
import { EventItem } from '../../types';
import { Calendar, MapPin, Clock, Users, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface EventsPublicPageProps {
  onNavigate: (route: string) => void;
}

export const EventsPublicPage: React.FC<EventsPublicPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registeredMap, setRegisteredMap] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetch('/api/events').then(res => res.json()).then(setEvents).catch(console.error);
  }, []);

  const handleRegister = async (eventId: string) => {
    if (!currentUser) {
      alert("Please login as a member to register for events.");
      onNavigate('/login');
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: currentUser.id })
      });

      if (res.ok) {
        setRegisteredMap({ ...registeredMap, [eventId]: true });
        // Refresh event list
        const updated = await (await fetch('/api/events')).json();
        setEvents(updated);
        alert("Event registration confirmed!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 text-slate-800">
      <div className="text-center space-y-2">
        <span className="text-xs font-extrabold tracking-widest text-blue-900 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          ASSOCIATION ACTIVITIES & EVENTS
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Upcoming Events, Seminars & Championships
        </h1>
        <p className="text-xs text-slate-600 max-w-xl mx-auto">
          Participate in judicial workshops, annual sports tournaments, and Foundation Day celebrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((evt) => (
          <div key={evt.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md flex flex-col justify-between">
            <div>
              <div className="relative h-48 overflow-hidden">
                <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-blue-950 text-amber-300 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  {evt.category}
                </span>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="font-bold text-slate-900 text-base">{evt.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-900 shrink-0" />
                    <span>{evt.date} • {evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-900 shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-900 shrink-0" />
                    <span>{evt.totalRegistered} Registered / {evt.maxCapacity} Max</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Deadline: {evt.registrationDeadline}</span>
              {registeredMap[evt.id] ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" /> Registered
                </span>
              ) : (
                <button
                  onClick={() => handleRegister(evt.id)}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                >
                  Register Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
