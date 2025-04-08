import React from "react";
import AutoInstallerForm from "../components/ubuntu/AutoInstallerForm";

export default function UbuntuInstallerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Auto Instalador Ubuntu 22.04</h1>
      <p className="text-gray-500 dark:text-gray-400">
        Ferramenta para geração de scripts de instalação personalizados para servidores Ubuntu 22.04
      </p>
      
      <AutoInstallerForm />
    </div>
  );
}