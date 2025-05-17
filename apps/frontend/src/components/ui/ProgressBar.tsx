import React, { FC, HTMLAttributes } from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  progress: number;
  min?: number;
  max?: number;
  label?: string;
  'aria-describedby'?: string;
}

type ProgressBarDivProps = {
  'aria-valuenow': number;
  'aria-valuemin': number;
  'aria-valuemax': number;
  'aria-label'?: string;
  'aria-describedby'?: string;
  role: 'progressbar';
  className: string;
  style: React.CSSProperties;
};

export const ProgressBar: FC<ProgressBarProps> = ({
  progress,
  min = 0,
  max = 100,
  label,
  'aria-describedby': describedBy,
  className = '',
  ...props
}) => {
  const percentage = Math.min(Math.max(progress, min), max);
  const widthPercentage = ((percentage - min) / (max - min)) * 100;
  const widthClass = `progressFill${Math.round(widthPercentage / 25) * 25}`;

  const progressBarProps: ProgressBarDivProps = {
    role: 'progressbar',
    'aria-valuenow': percentage,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-label': label,
    'aria-describedby': describedBy,
    className: `${styles.progressBar} ${styles[widthClass]} ${className}`.trim(),
    style: {
      ...props.style,
      '--progress': `${widthPercentage}%`,
    } as React.CSSProperties,
  };

  return (
    <div className={styles.progressContainer} {...props}>
      <div className={styles.progressTrack}>
        <div {...progressBarProps}>
          <span className={styles.srOnly}>
            {Math.round(percentage)}% complete
          </span>
        </div>
      </div>
    </div>
  );
};
