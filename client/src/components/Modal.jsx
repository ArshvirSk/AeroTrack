const Modal = ({ flight, onClose }) => {
  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl z-[9999] p-6 transform transition-transform duration-300 ease-in-out pointer-events-auto">
      <h2 className="text-xl font-bold mb-4">Flight Information</h2>
      <p>
        <strong>Airline:</strong> {flight.airline.name} ({flight.airline.iata})
      </p>
      <p>
        <strong>Flight Number:</strong> {flight.flight.number}
      </p>
      <p>
        <strong>Departure:</strong> {flight.departure.airport} (
        {flight.departure.iata})
      </p>
      <p>
        <strong>Departure Time:</strong> {flight.departure.time}
      </p>
      <p>
        <strong>Arrival:</strong> {flight.arrival.airport} (
        {flight.arrival.iata})
      </p>
      <p>
        <strong>Arrival Time:</strong> {flight.arrival.time}
      </p>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-red-500 px-4 py-2 rounded"
      >
        Close
      </button>
    </div>
  );
};

export default Modal;
