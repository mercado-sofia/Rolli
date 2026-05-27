import { cn } from "@/lib/utils";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Field({ label, error, id, className, ...props }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={cn(
          "w-full rounded-2xl border border-lavender/50 bg-white/90 px-4 py-3 text-base text-ink outline-none ring-lavender-deep focus:ring-2",
          className,
        )}
      />
      {error && <p className="text-sm text-pink">{error}</p>}
    </div>
  );
}
