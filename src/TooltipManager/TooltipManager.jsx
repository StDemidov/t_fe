import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const tooltipRoot = document.getElementById('tooltip-root');

let externalSetState = null;

export const showTooltip = (content) => {
  if (externalSetState) {
    externalSetState({ visible: true, content });
  }
};

export const hideTooltip = () => {
  if (externalSetState) {
    externalSetState({
      visible: false,
      content: '',
      coords: { top: 0, left: 0 },
    });
  }
};

const TooltipManager = () => {
  const [tooltipState, setTooltipState] = useState({
    visible: false,
    content: '',
    coords: { top: 0, left: 0 },
  });

  useEffect(() => {
    externalSetState = setTooltipState;
    return () => {
      externalSetState = null;
    };
  }, []);

  if (!tooltipState.visible || !tooltipRoot) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: 50,
        right: 50,
        backgroundColor: '#fff',
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '6px',
        fontSize: '12px',
        maxWidth: '220px',
        zIndex: 9999,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        pointerEvents: 'none',
      }}
    >
      {tooltipState.content}
    </div>,
    tooltipRoot
  );
};

export default TooltipManager;
