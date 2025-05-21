import { Loader2 } from 'lucide-react';

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Loader = ({ className, ...props }: LoaderProps) => {
  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );
};

export default Loader;
