"use client";

import { Categories } from "@/app/src/modules/overview/user";
import CategoryBar from "@/app/src/ui/categoryBar";

function getCategoryData(categories: Categories) {
    const data = [
        { name: "Normale Anwesenheiten", count: categories.normal, color: "bg-blue-500" },
        { name: "Vertretene Studienzeiten", count: categories.parallel, color: "bg-yellow-500" },
        { name: "Studienzeiten mit Notizen", count: categories.notes, color: "bg-orange-500" },
        { name: "Fehlzeiten", count: categories.absent, color: "bg-red-600" },
    ];
    return data;
}

export function OverviewChart(props: { categories: Categories }) {
  const categories = getCategoryData(props.categories);
  return (
    <div className="m-4">
      <CategoryBar categories={categories} />
      <div className="text-center mt-4 space-x-4 grid grid-rows-1 grid-cols-4">
        {categories.map((cat, index) => (
          <span key={index} className="flex flex-row items-center space-x-2">
            <div className={`mr-2 w-[10px] h-[10px] ${cat.color}`} />
            {cat.count + " " + cat.name}
          </span>
        ))}
      </div>
    </div>
  )
} 

export function TableOverviewChart(props: { categories: Categories }) {
  const categories = getCategoryData(props.categories);
  return (
    <span>
      <CategoryBar categories={categories} />
      <div className="text-center mt-4 space-x-4 grid grid-rows-1 grid-cols-4">
        {categories.map((cat, index) => (
          <span key={index} className="flex flex-row items-center space-x-2">
            <div className={`mr-2 w-[10px] h-[10px] ${cat.color}`} />
            {cat.count}
          </span>
        ))}
      </div>
    </span>
  )
}