import BidanLayout from './components/BidanLayout';

export default function BidanDashboard() {
  return (
    <BidanLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold text-gray-900">
          Dashboard Analitik
        </h1>
        <p className="text-gray-600">
          Visualisasi data Prenava.
        </p>

        <div className="mt-2 w-full" style={{ height: '80vh' }}>
          <iframe
            width="100%"
            height="100%"
            src="https://lookerstudio.google.com/embed/reporting/17a36abe-b9dc-4850-9ef2-f8d2c95bad22/page/d67jF"
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>
    </BidanLayout>
  );
}
