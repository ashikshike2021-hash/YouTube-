export const FilterBar = () => {
  const filters = ['All', 'Music', 'Live', 'Gaming', 'Programming', 'News', 'Recently uploaded', 'Watched'];
  return (
    <div className="flex gap-2 overflow-x-auto py-2">
      {filters.map((filter, i) => (
        <button key={filter} className={`px-3 py-1 text-sm rounded-lg whitespace-nowrap ${i === 0 ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
          {filter}
        </button>
      ))}
    </div>
  );
};
