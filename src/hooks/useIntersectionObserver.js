/**
 * Intersection Observer 커스텀 훅
 * 무한 스크롤, lazy loading 등에 사용
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Intersection Observer 훅
 * @param {Object} options - IntersectionObserver 옵션
 * @returns {[Function, boolean]} [setRef, isIntersecting]
 */
export const useIntersectionObserver = (options = {}) => {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [node, setNode] = useState(null);
  const observer = useRef(null);

  useEffect(() => {
    // 이미 보이고 freeze 옵션이 켜져 있으면 observer 생성 안함
    if (freezeOnceVisible && isIntersecting) {
      return;
    }

    // 이전 observer 정리
    if (observer.current) {
      observer.current.disconnect();
    }

    // 노드가 없으면 observer 생성 안함
    if (!node) {
      return;
    }

    observer.current = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, root, rootMargin }
    );

    observer.current.observe(node);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [node, threshold, root, rootMargin, freezeOnceVisible, isIntersecting]);

  return [setNode, isIntersecting];
};

/**
 * 무한 스크롤 훅
 * @param {Function} onLoadMore - 추가 데이터 로드 함수
 * @param {Object} options - 옵션
 * @returns {[Function, boolean]} [setRef, loading]
 */
export const useInfiniteScroll = (onLoadMore, options = {}) => {
  const { hasMore = true, threshold = 1.0 } = options;
  const [loading, setLoading] = useState(false);
  const [setRef, isIntersecting] = useIntersectionObserver({ threshold });

  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      setLoading(true);
      onLoadMore().finally(() => setLoading(false));
    }
  }, [isIntersecting, hasMore, loading, onLoadMore]);

  return [setRef, loading];
};

/**
 * Lazy Loading 이미지 훅
 * @param {string} src - 이미지 URL
 * @returns {[Function, string, boolean]} [setRef, imageSrc, loaded]
 */
export const useLazyImage = (src) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [setRef, isIntersecting] = useIntersectionObserver({
    threshold: 0,
    freezeOnceVisible: true,
  });

  useEffect(() => {
    if (isIntersecting && src && !loaded) {
      setImageSrc(src);
      setLoaded(true);
    }
  }, [isIntersecting, src, loaded]);

  return [setRef, imageSrc, loaded];
};

export default useIntersectionObserver;
