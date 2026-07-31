export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-3" />
      <p className="text-xs sm:text-sm text-gray-500 font-medium animate-pulse">
        กำลังโหลดข้อมูล...
      </p>
    </div>
  );
}
