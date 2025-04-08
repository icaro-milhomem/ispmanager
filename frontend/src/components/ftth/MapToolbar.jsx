import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  MousePointer, 
  Plus, 
  Unlink, 
  Link,
  Move,
  ZoomIn,
  Target,
  Home,
  Grid
} from "lucide-react";

export default function MapToolbar({ 
  currentTool, 
  setCurrentTool,
  drawingCable,
  setCableStart,
  setDrawingCable
}) {
  return (
    <div className="flex items-center gap-2 mb-4 p-1 border rounded-md bg-white">
      <TooltipProvider>
        <div className="flex gap-1 border-r pr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant={currentTool === "select" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentTool("select");
                  if (drawingCable) {
                    setDrawingCable(false);
                    setCableStart(null);
                  }
                }}
              >
                <MousePointer className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Selecionar (ESC)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant={currentTool === "add" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentTool("add");
                  if (drawingCable) {
                    setDrawingCable(false);
                    setCableStart(null);
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adicionar Elemento</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant={currentTool === "cable" ? "default" : "ghost"}
                onClick={() => {
                  setCurrentTool("cable");
                }}
              >
                <Link className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Conectar Elementos</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex gap-1 border-r pr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost"
              >
                <Move className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mover Elemento</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost"
              >
                <Unlink className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remover Conexão</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost"
              >
                <Target className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Centralizar</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost"
              >
                <Home className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Voltar à visão inicial</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mostrar/Ocultar Grid</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}