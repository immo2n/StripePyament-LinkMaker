import { useState } from "react";

export default function ItineraryCell({ itineraryUrl }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!itineraryUrl) return null;

  return (
    <>
      <img
        src={itineraryUrl}
        alt="Itinerary"
        className="w-32 h-auto rounded-md border cursor-pointer hover:opacity-80"
        onClick={() => setIsOpen(true)}
      />

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={itineraryUrl}
              alt="Itinerary Enlarged"
              className="max-h-[90%] max-w-[90%] rounded-md shadow-lg"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
