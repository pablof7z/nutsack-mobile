import React from 'react';
import { Text } from '@/components/Themed';
interface RelativeTimeProps {
  timestamp: number;
}

const RelativeTime: React.FC<RelativeTimeProps> = ({ timestamp }) => {
    return (
        <Text>test</Text>
    )
  const getRelativeTime = (timestamp: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;

    if (diff < minute) {
      return 'just now';
    } else if (diff < hour) {
      const minutes = Math.floor(diff / minute);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diff < day) {
      const hours = Math.floor(diff / hour);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diff < week) {
      const days = Math.floor(diff / day);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return new Date(timestamp * 1000).toLocaleDateString();
    }
  };

  return <span>{getRelativeTime(timestamp)}</span>;
};

export default RelativeTime;
