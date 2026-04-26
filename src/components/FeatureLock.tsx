interface FeatureLockProps {
  children: React.ReactNode;
  featureName?: string;
}

export const FeatureLock = ({ children }: FeatureLockProps) => {
  // Premium je omogućen za sve — bez zaključavanja.
  return <>{children}</>;
};
