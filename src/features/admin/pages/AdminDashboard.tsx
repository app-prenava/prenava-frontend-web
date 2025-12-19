export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold text-gray-900">Dashboard Analitik</h1>
      <p className="text-gray-600">
        Visualisasi data Prenava.
      </p>

      <div className="mt-2 w-full">
        <iframe
          title="Prenava Analytics Dashboard"
          width="100%"
          height="1100"
          src="https://lookerstudio.google.com/embed/reporting/3c2a39c2-0598-4c6d-99c2-4183a9f30bbf/page/8VPiF"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
