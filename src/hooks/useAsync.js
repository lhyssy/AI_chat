import { useState, useCallback } from 'react';
import { handleError } from '../utils/helpers';

const useAsync = (asyncFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...params) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction(...params);
      setData(result);
      return result;
    } catch (error) {
      const errorInfo = handleError(error);
      setError(errorInfo);
      throw errorInfo;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  return { data, loading, error, execute };
};

export default useAsync; 