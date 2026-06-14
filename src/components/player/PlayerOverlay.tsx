import type { ReactNode } from "react";

export function PlayerOverlay({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-black/72 p-6 text-center text-white">
      <div className="max-w-sm">
        <div className="mx-auto mb-3 grid size-12 place-items-center rounded-lg bg-white/12">{icon}</div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-white/78">{body}</p>
        {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}
