export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <h2 className="text-lg font-semibold">
        Vetronix Admin
      </h2>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-600" />

        <div>
          <p className="font-medium">
            Admin
          </p>

          <p className="text-sm text-gray-500">
            Administrator
          </p>
        </div>
      </div>
    </header>
  );
}