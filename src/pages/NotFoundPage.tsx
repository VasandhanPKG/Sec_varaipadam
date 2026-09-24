import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 text-center">
      <div className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-2xl mb-6 text-blue-400">
        <Compass className="w-12 h-12 animate-spin" />
      </div>
      <h1 className="text-4xl font-extrabold mb-2 font-serif">404 - Space Not Found</h1>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        The floor level or room coordinates you are searching for do not exist in the SecMap spatial database.
      </p>
      <Link
        to="/"
        className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition"
      >
        <Home className="w-4 h-4" />
        <span>Return to Campus Blueprint</span>
      </Link>
    </div>
  );
}
export default NotFoundPage;
