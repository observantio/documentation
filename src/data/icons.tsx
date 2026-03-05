import React from "react";
import { Cpu, Database, FileText, Shield, Lock, Command } from "lucide-react";
import type { IconKey } from "./slideTypes";

export const iconFor = (k: IconKey): React.ReactNode => {
  switch (k) {
    case "database":
      return <Database className="h-5 w-5" />;

    case "cpu":
      return <Cpu className="h-5 w-5" />;

    case "fileText":
      return <FileText className="h-5 w-5" />;

    case "shield":
      return <Shield className="h-5 w-5" />;

    case "lock":
      return <Lock className="h-5 w-5" />;

    case "command":
      return <Command className="h-5 w-5" />;

    default:
      return null;
  }
};