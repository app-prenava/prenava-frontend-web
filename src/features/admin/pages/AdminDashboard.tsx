export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold text-gray-900">Dashboard Analitik</h1>
      <p className="text-gray-600">
        Visualisasi data Prenava.
      </p>

      <div className="mt-2 w-full" style={{ height: '80vh' }}>
        <iframe
          width="100%"
          height="100%"
          src="https://lookerstudio.google.com/embed/reporting/cce62159-6f72-4a71-9564-d02a7a3b68b1/page/yX2jF"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
