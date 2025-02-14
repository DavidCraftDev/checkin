"use client";

export default function CategoryBar(params: { categories: { name: string, count: number, color: string }[] }) {
  const totalCount = params.categories.reduce((sum, cat) => sum + cat.count, 0);
  return (
    <div className="w-full bg-gray-200 h-6 rounded-md overflow-hidden flex">
      {params.categories.map((cat, index) => (
        <div
          key={index}
          className={`h-full ${cat.color}`}
          style={{ width: `${(cat.count / totalCount) * 100}%` }}
          title={`${cat.name}: ${cat.count}/${totalCount}`}
        />
      ))}
    </div>
  );
}