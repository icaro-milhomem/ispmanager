import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const statusColors = {
  good: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
};

const statusBackgrounds = {
  good: "bg-green-50",
  warning: "bg-yellow-50",
  error: "bg-red-50",
};

export default function NetworkStatusCard({ title, value, status, icon: Icon }) {
  return (
    <Card className={`border ${statusBackgrounds[status]}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
          </div>
          <div className={`${statusColors[status]}`}>
            <Icon className="w-8 h-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}