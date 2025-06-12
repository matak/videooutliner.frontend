import { useState } from 'react';
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

  const renderNode = (node: OutlineNode, level: number = 0) => {
    const isExpanded = expandedSections.has(node.title);
    const hasSubsections = node.subsections.length > 0;
    const startTimeInSeconds = timeToSeconds(node.start_time);
    const isCurrentSection = Math.abs(currentTime - startTimeInSeconds) < 1;

    return (
      <div key={node.title} className="mb-1">
        <div
          className={`
            flex items-center p-2 rounded cursor-pointer
            ${isCurrentSection ? 'bg-blue-100' : 'hover:bg-gray-100'}
          `}
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        >
          {hasSubsections && (
            <button
              onClick={() => toggleSection(node.title)}
              className="mr-2 w-4 h-4 flex items-center justify-center"
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
            {node.title}
          </span>
          <span className="text-sm text-gray-500 ml-2">
            {node.start_time}
          </span>
        </div>
        {hasSubsections && isExpanded && (
          <div className="mt-1">
            {node.subsections.map(subsection => renderNode(subsection, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      {outline.map(node => renderNode(node))}
    </div>
  );
}; 