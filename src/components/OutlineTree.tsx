import { useState, useEffect, useRef } from 'react';
import { timeToSeconds } from '../utils/timeUtils';

interface OutlineNode {
  title: string;
  start_time: string;
  subsections: OutlineNode[];
}

interface OutlineTreeProps {
  outline: OutlineNode[];
  currentTime: number;
  onSeek: (timeInSeconds: number) => void;
}

export const OutlineTree = ({ outline, currentTime, onSeek }: OutlineTreeProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeSections, setActiveSections] = useState<Set<string>>(new Set());
  const currentTimeRef = useRef(currentTime);
  const initialHashChecked = useRef(false);

  // Update the ref whenever currentTime changes
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Update active sections every 10 seconds
  useEffect(() => {
    const updateActiveSections = () => {
      const newActiveSections = new Set<string>();
      
      const checkNode = (node: OutlineNode) => {
        const startTimeInSeconds = timeToSeconds(node.start_time);
        if (currentTimeRef.current >= startTimeInSeconds) {
          newActiveSections.add(node.title);
        }
        node.subsections.forEach(checkNode);
      };
      
      outline.forEach(checkNode);
      setActiveSections(newActiveSections);
      console.log('Debug: Current video time:', currentTimeRef.current, 'Active sections:', Array.from(newActiveSections));

      // Only update hash and localStorage if we've passed the initial load
      if (initialHashChecked.current) {
        // Update URL hash and localStorage with current timestamp
        const timestamp = Math.floor(currentTimeRef.current);
        const newHash = `#${timestamp}`;
        
        // Update URL hash if different
        if (window.location.hash !== newHash) {
          window.location.hash = newHash;
        }

        // Update localStorage
        const videoParam = new URLSearchParams(window.location.search).get('video');
        if (videoParam) {
          localStorage.setItem(`videoTime_${videoParam}`, timestamp.toString());
        }
      } else {
        initialHashChecked.current = true;
      }
    };

    // Initial check
    updateActiveSections();
    
    // Set up interval for checks every 10 seconds
    const interval = setInterval(updateActiveSections, 10000);
    return () => clearInterval(interval);
  }, [outline]); // Only re-run if outline changes

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const renderNode = (node: OutlineNode, level: number = 0, parentNumber: string = '', index: number = 0) => {
    const isExpanded = expandedSections.has(node.title);
    const hasSubsections = node.subsections.length > 0;
    const startTimeInSeconds = timeToSeconds(node.start_time);
    const isActive = activeSections.has(node.title);
    
    // Calculate the current node number
    const currentNumber = parentNumber ? `${parentNumber}.${index + 1}` : `${index + 1}`;

    return (
      <div key={node.title} className="mb-1">
        <div
          className={`
            flex items-center p-2 rounded cursor-pointer
            ${isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-100'}
          `}
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        >
          {hasSubsections && (
            <button
              onClick={() => toggleSection(node.title)}
              className={`mr-2 w-4 h-4 flex items-center justify-center rounded
                ${isActive ? 'bg-black text-white' : ''}
              `}
            >
              <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                ▶
              </span>
            </button>
          )}
          <span
            onClick={() => onSeek(startTimeInSeconds)}
            className="flex-1"
          >
            {currentNumber}. {node.title}
          </span>
          <span className={`text-sm ml-2 ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
            {node.start_time}
          </span>
        </div>
        {hasSubsections && isExpanded && (
          <div className="mt-1">
            {node.subsections.map((subsection, idx) => renderNode(subsection, level + 1, currentNumber, idx))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      {outline.map((node, idx) => renderNode(node, 0, '', idx))}
    </div>
  );
}; 