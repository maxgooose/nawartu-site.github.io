import React, { useState, useEffect, useRef } from 'react';

const BlackWhiteBlobs = () => {
  const [frame, setFrame] = useState(0);
  const [patternType, setPatternType] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mouseDown, setMouseDown] = useState(false);
  const containerRef = useRef(null);

  const patternTypes = ['balance', 'duality', 'flow', 'chaos'];
  const width = 80;
  const height = 40;
  const slowdownFactor = 3;

  // Text formation parameters
  const textFormationFrames = 180;
  const text1 = "HARB";
  const text2 = "NAWARTU"; 
  const text3 = "AWA";

  // Dark green colors only
  const darkGreenColors = [
    '#006400', '#2F4F2F', '#228B22', '#008000', '#1F4F1F'
  ];
  
  const BACKGROUND_COLOR = '#F0EEE6';

  const patterns = {
    balance: (x, y, t) => {
      const cx = 40;
      const cy = 20;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return Math.sin(dx * 0.3 + t * 0.5) *
             Math.cos(dy * 0.3 + t * 0.3) *
             Math.sin(dist * 0.1 - t * 0.4);
    },
    duality: (x, y, t) => {
      const cx = 40;
      const left = x < cx ? Math.sin(x * 0.2 + t * 0.3) : 0;
      const right = x >= cx ? Math.cos(x * 0.2 - t * 0.3) : 0;
      return left + right + Math.sin(y * 0.3 + t * 0.2);
    },
    flow: (x, y, t) => {
      const angle = Math.atan2(y - 20, x - 40);
      const dist = Math.sqrt((x - 40) ** 2 + (y - 20) ** 2);
      return Math.sin(angle * 3 + t * 0.4) *
             Math.cos(dist * 0.1 - t * 0.3);
    },
    chaos: (x, y, t) => {
      const noise1 = Math.sin(x * 0.5 + t) * Math.cos(y * 0.3 - t);
      const noise2 = Math.sin(y * 0.4 + t * 0.5) * Math.cos(x * 0.2 + t * 0.7);
      const noise3 = Math.sin((x + y) * 0.2 + t * 0.8);
      return noise1 * 0.3 + noise2 * 0.3 + noise3 * 0.4;
    }
  };

  useEffect(() => {
    let animationId;
    const animate = () => {
      setFrame(f => (f + 1) % (240 * slowdownFactor));
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const generateAsciiArt = () => {
    const t = (frame * Math.PI) / (60 * slowdownFactor);
    const currentPattern = patterns[patternTypes[patternType]];

    // Calculate text progress
    const progress = Math.min(frame / textFormationFrames, 1);
    const harbProgress = Math.min(progress * 3, 1);
    const nawartuProgress = Math.min(Math.max((progress - 0.3) * 3, 0), 1);
    const awaProgress = Math.min(Math.max((progress - 0.6) * 3, 0), 1);

    const harbText = text1.substring(0, Math.floor(text1.length * harbProgress));
    const nawartuText = text2.substring(0, Math.floor(text2.length * nawartuProgress));
    const awaText = text3.substring(0, Math.floor(text3.length * awaProgress));

    // Color cycling
    const colorIndex = Math.floor(t * 2) % darkGreenColors.length;
    const textColor = darkGreenColors[colorIndex];

    // Text positions
    const harbY = Math.floor(height / 2) - 4;
    const nawartuY = Math.floor(height / 2);
    const awaY = Math.floor(height / 2) + 4;

    const harbStartX = Math.floor((width - harbText.length * 2) / 2);
    const nawartuStartX = Math.floor((width - nawartuText.length * 2) / 2);
    const awaStartX = Math.floor((width - awaText.length * 2) / 2);

    let result = '';
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let char = ' ';
        let isText = false;

        // Check if current position should show text
        if (y === harbY && harbText.length > 0) {
          const textIndex = Math.floor((x - harbStartX) / 2);
          if (textIndex >= 0 && textIndex < harbText.length && (x - harbStartX) % 2 === 0) {
            char = `<span style="color: ${textColor}; font-size: 16px; font-weight: bold;">${harbText[textIndex]}</span>`;
            isText = true;
          }
        }
        
        if (!isText && y === nawartuY && nawartuText.length > 0) {
          const textIndex = Math.floor((x - nawartuStartX) / 2);
          if (textIndex >= 0 && textIndex < nawartuText.length && (x - nawartuStartX) % 2 === 0) {
            char = `<span style="color: ${textColor}; font-size: 16px; font-weight: bold;">${nawartuText[textIndex]}</span>`;
            isText = true;
          }
        }
        
        if (!isText && y === awaY && awaText.length > 0) {
          const textIndex = Math.floor((x - awaStartX) / 2);
          if (textIndex >= 0 && textIndex < awaText.length && (x - awaStartX) % 2 === 0) {
            char = `<span style="color: ${textColor}; font-size: 16px; font-weight: bold;">${awaText[textIndex]}</span>`;
            isText = true;
          }
        }

        if (!isText) {
          // Generate background pattern
          let value = currentPattern(x, y, t);
          
          if (mouseDown && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const dx = x - (((mousePos.x - rect.left) / rect.width) * width);
            const dy = y - (((mousePos.y - rect.top) / rect.height) * height);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const mouseInfluence = Math.exp(-dist * 0.1) * Math.sin(t * 2);
            value += mouseInfluence * 0.8;
          }
          
          if (value > 0.8) {
            char = '█';
          } else if (value > 0.5) {
            char = '▓';
          } else if (value > 0.2) {
            char = '▒';
          } else if (value > -0.2) {
            char = '░';
          } else if (value > -0.5) {
            char = '·';
          } else {
            char = ' ';
          }
        }
        
        result += char;
      }
      result += '\n';
    }
    
    return result;
  };

  const handleClick = () => {
    setPatternType((prev) => (prev + 1) % patternTypes.length);
  };

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseDown = () => {
    setMouseDown(true);
  };

  const handleMouseUp = () => {
    setMouseDown(false);
  };

  return (
    <div 
      style={{ 
        margin: 0,
        padding: 0,
        background: BACKGROUND_COLOR,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw'
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      ref={containerRef}
    >
      <pre style={{
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: '1',
        letterSpacing: '0.1em',
        color: '#333',
        userSelect: 'none',
        cursor: 'pointer',
        margin: 0,
        padding: 0
      }}
      dangerouslySetInnerHTML={{ __html: generateAsciiArt() }}
      />
    </div>
  );
};

export default BlackWhiteBlobs;