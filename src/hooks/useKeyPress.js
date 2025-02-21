import { useEffect, useCallback } from 'react';

const useKeyPress = (targetKey, callback, deps = []) => {
  const handleKeyPress = useCallback((event) => {
    // 检查是否在输入框中
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    // 检查组合键
    if (typeof targetKey === 'object') {
      const { key, ctrlKey, shiftKey, altKey, metaKey } = targetKey;
      if (
        event.key === key &&
        event.ctrlKey === !!ctrlKey &&
        event.shiftKey === !!shiftKey &&
        event.altKey === !!altKey &&
        event.metaKey === !!metaKey
      ) {
        callback(event);
      }
    } else if (event.key === targetKey) {
      // 单个键
      callback(event);
    }
  }, [targetKey, callback]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress, ...deps]);
};

export default useKeyPress; 