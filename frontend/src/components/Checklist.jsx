import { CheckCircle2, Circle } from "lucide-react";

const PasswordRequirement = ({ valid, children }) => (
  <div
    className={`flex items-center gap-2 text-xs ${
      valid ? "text-green-400" : "text-slate-400"
    }`}
  >
    {valid ? (
      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
    ) : (
      <Circle className="w-4 h-4 flex-shrink-0" />
    )}
    <span>{children}</span>
  </div>
);

export default PasswordRequirement;