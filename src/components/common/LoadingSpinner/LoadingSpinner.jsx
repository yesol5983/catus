import './LoadingSpinner.css';

/**
 * LoadingSpinner 컴포넌트
 * @param {string} size - 크기 ('small' | 'medium' | 'large')
 * @param {string} color - 색상 (CSS 색상 값)
 * @param {string} text - 로딩 텍스트
 * @param {boolean} fullScreen - 전체 화면 여부
 * @param {string} className - 추가 클래스명
 */
function LoadingSpinner({
  size = 'medium',
  color,
  text,
  fullScreen = false,
  className = ''
}) {
  const spinnerClass = [
    'loading-spinner',
    `spinner-${size}`,
    fullScreen && 'spinner-fullscreen',
    className
  ].filter(Boolean).join(' ');

  const spinnerStyle = color ? { borderTopColor: color } : undefined;

  return (
    <div className={spinnerClass}>
      <div className="spinner" style={spinnerStyle}></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;
