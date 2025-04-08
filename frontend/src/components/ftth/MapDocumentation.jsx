import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Layers,
  MapPin,
  Code,
  Network,
  Cable,
  Info,
  HelpCircle,
  Router,
  Home
} from "lucide-react";

export default function MapDocumentation() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          <CardTitle>Documentação do Mapa FTTH</CardTitle>
        </div>
        <CardDescription>
          Como o mapa é implementado e como utilizá-lo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ... resto do código permanece o mesmo ... */}
      </CardContent>
    </Card>
  );
}