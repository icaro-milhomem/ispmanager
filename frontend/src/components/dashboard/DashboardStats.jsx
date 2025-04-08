import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function DashboardStats({ title, value, total, trend, icon: Icon, color, link }) {
  // Mapeamento de cores para classes do Tailwind
  const colorMap = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-800",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/30",
      text: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-100 dark:bg-green-800",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-800",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/30",
      text: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-100 dark:bg-orange-800",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/30",
      text: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-800",
    },
  };

  const colorClass = colorMap[color] || colorMap.blue;

  return (
    <Card className={`${colorClass.bg} border-none hover:shadow-md transition-shadow duration-200`}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold dark:text-white">{value}</p>
              {total && (
                <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  de {total}
                </p>
              )}
            </div>
            {trend && (
              <p className={`mt-1 text-sm ${colorClass.text}`}>{trend}</p>
            )}
          </div>
          <div className={`${colorClass.iconBg} p-3 rounded-full`}>
            <Icon className={`h-6 w-6 ${colorClass.text}`} />
          </div>
        </div>

        {link && (
          <div className="mt-6">
            <Link
              to={link}
              className={`text-sm font-medium flex items-center ${colorClass.text} hover:underline`}
            >
              Ver detalhes
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}