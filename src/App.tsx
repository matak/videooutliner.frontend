import { useState, useEffect, useRef } from 'react';
import { VideoPlayer, VideoPlayerRef } from './components/VideoPlayer';
import { OutlineTree } from './components/OutlineTree';

interface OutlineNode {
  title: string;
  start_time: string;
  subsections: OutlineNode[];
}

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [outline, setOutline] = useState<OutlineNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const savedWidth = localStorage.getItem('sidebarWidth');
    return savedWidth ? parseInt(savedWidth, 10) : 200;
  });
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const isInitialLoad = useRef(true);
  const initialTimeSet = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const videoParam = params.get('video');
    const videoPath = window.location.protocol + "//" + window.location.hostname + '/public/videos'
    
    console.log('Debug Info:', {
      rawVideoParam: videoParam,
      fullUrl: window.location.href,
      protocol: window.location.protocol,
      host: window.location.host,
      pathname: window.location.pathname,
      videoPath: videoPath
    });

    if (videoParam) {
      try {
        const fullVideoOutlinePath = videoPath + "/" + videoParam + "/" + videoParam + ".outline.json";
        console.log('Processed full video outline path:', fullVideoOutlinePath);

        const fullVideoPath = videoPath + "/" + videoParam + "/" + videoParam + ".avi";
        console.log('Processed full video path:', fullVideoPath);
        
        // Load the outline JSON
        fetch(fullVideoOutlinePath)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to load outline: ${response.statusText}`);
            }
            return response.json();
          })
          .then(data => {
            setOutline(data);
            setError(null);
          })
          .catch(err => {
            setError(`Error loading outline: ${err.message}`);
          });

        setVideoUrl(fullVideoPath);

        // Check for timestamp in URL hash or localStorage on initial load
        if (isInitialLoad.current && !initialTimeSet.current) {
          let timestamp: number | null = null;
          
          // First check URL hash
          const hash = window.location.hash;
          if (hash) {
            const hashTimestamp = parseFloat(hash.substring(1));
            if (!isNaN(hashTimestamp)) {
              timestamp = hashTimestamp;
              console.log('Setting initial time from URL hash:', timestamp);
            }
          }
          
          // If no valid hash, check localStorage
          if (timestamp === null) {
            const storedTime = localStorage.getItem(`videoTime_${videoParam}`);
            if (storedTime) {
              timestamp = parseFloat(storedTime);
              console.log('Setting initial time from localStorage:', timestamp);
            }
          }

          // Apply the timestamp if found
          if (timestamp !== null) {
            setCurrentTime(timestamp);
            // Use setTimeout to ensure video player is ready
            setTimeout(() => {
              if (videoPlayerRef.current) {
                videoPlayerRef.current.seekTo(timestamp!);
                initialTimeSet.current = true;
              }
            }, 100);
          }
          
          isInitialLoad.current = false;
        }
      } catch (err) {
        setError(`Error processing video URL: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      setError('No video parameter provided in URL');
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const delta = e.pageX - startX.current;
    const newWidth = Math.max(150, Math.min(500, startWidth.current + delta));
    setSidebarWidth(newWidth);
    localStorage.setItem('sidebarWidth', newWidth.toString());
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleSeek = (timeInSeconds: number) => {
    setCurrentTime(timeInSeconds);
    videoPlayerRef.current?.seekTo(timeInSeconds);
  };

  const filterOutline = (nodes: OutlineNode[], query: string): OutlineNode[] => {
    if (!query) return nodes;
    
    return nodes.filter(node => {
      const matchesTitle = node.title.toLowerCase().includes(query.toLowerCase());
      const matchingSubsections = filterOutline(node.subsections, query);
      return matchesTitle || matchingSubsections.length > 0;
    }).map(node => ({
      ...node,
      subsections: filterOutline(node.subsections, query)
    }));
  };

  return (
    <div className="h-screen flex">
      <div 
        className="bg-white border-r relative"
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <input
                type="text"
                placeholder="Search outline..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <OutlineTree
              outline={filterOutline(outline, searchQuery)}
              currentTime={currentTime}
              onSeek={handleSeek}
            />
          </div>
        </div>
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
          onMouseDown={handleMouseDown}
        />
      </div>
      <div className="flex-1 bg-white">
        {error ? (
          <div className="p-4 text-red-600">
            {error}
          </div>
        ) : videoUrl ? (
          <VideoPlayer
            ref={videoPlayerRef}
            videoUrl={videoUrl}
            onTimeUpdate={setCurrentTime}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No video URL provided. Add ?video=/path/to/video.avi to the URL.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
