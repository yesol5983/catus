import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from '../contexts/TutorialContext';
import { TUTORIAL_STEPS } from '../constants/tutorialSteps';

function Tutorial({ onComplete }) {
  const { currentStep, nextStep, completeTutorial } = useTutorial();
  const [targetRect, setTargetRect] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  const currentTutorial = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  // 디버깅: currentStep 변경 감지
  useEffect(() => {
    console.log('Tutorial 렌더링:', { currentStep, currentTutorial, isLastStep });
  }, [currentStep]);

  // 타겟 요소 위치 계산
  useEffect(() => {
    if (!currentTutorial?.target) {
      setTargetRect(null);
      return;
    }

    const updateTargetRect = () => {
      const element = document.querySelector(currentTutorial.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        console.log('타겟 요소 크기:', {
          target: currentTutorial.target,
          width: rect.width,
          height: rect.height
        });
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      }
    };

    // 폰트 로드 후 타겟 크기 계산
    document.fonts.ready.then(() => {
      // 폰트 로드 후 약간의 지연을 두고 크기 계산 (렌더링 완료 대기)
      setTimeout(updateTargetRect, 100);
    });

    window.addEventListener('resize', updateTargetRect);
    return () => window.removeEventListener('resize', updateTargetRect);
  }, [currentStep, currentTutorial]);

  // 다음 버튼 클릭
  const handleNext = () => {
    console.log('handleNext 호출:', { currentStep, isLastStep, totalSteps: TUTORIAL_STEPS.length });
    if (isLastStep) {
      handleComplete();
    } else {
      nextStep();
    }
  };

  // 튜토리얼 완료
  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      completeTutorial();
      if (onComplete) onComplete();
    }, 300);
  };

  // 건너뛰기
  const handleSkip = () => {
    handleComplete();
  };

  // 메시지 위치와 화살표 방향 계산
  const getMessageStyle = () => {
    if (!targetRect || !currentTutorial) {
      return {
        style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
        arrow: null,
        arrowLeft: null,
        messageLeft: null
      };
    }

    const position = currentTutorial.position;
    const padding = 24; // 버튼과 말풍선 사이 간격
    const messageWidth = 180; // maxWidth
    let arrowPosition = null;
    let arrowLeft = null; // 화살표의 left 위치
    let messageLeft = null; // 말풍선의 left 위치 (픽셀 값)

    // 버튼의 중심 좌표 계산
    const targetCenterX = targetRect.left + targetRect.width / 2;

    let style = {};

    switch (position) {
      case 'top':
        // 말풍선이 타겟 위에 위치
        // 말풍선을 화면 중앙에 배치하되, 화면 밖으로 나가지 않도록
        messageLeft = Math.max(20, Math.min(window.innerWidth - messageWidth - 20, targetCenterX - messageWidth / 2));

        style = {
          bottom: `${window.innerHeight - targetRect.top + padding}px`,
          left: `${messageLeft}px`
        };
        arrowPosition = 'bottom';
        // 화살표는 버튼 중심을 가리킴 (말풍선의 left 위치 대비 상대적 위치)
        arrowLeft = `${targetCenterX - messageLeft}px`;
        break;
      case 'bottom':
        // 말풍선이 타겟 아래에 위치 (톱니바퀴)
        // 버튼이 화면 오른쪽에 있으면 말풍선을 더 왼쪽으로 이동
        const isRightSide = targetCenterX > window.innerWidth * 0.7;
        if (isRightSide) {
          // 화면 오른쪽에서 충분한 여백을 두고 배치
          messageLeft = window.innerWidth - messageWidth - 60;
        } else {
          messageLeft = Math.max(20, Math.min(window.innerWidth - messageWidth - 20, targetCenterX - messageWidth / 2));
        }

        style = {
          top: `${targetRect.top + targetRect.height + padding}px`,
          left: `${messageLeft}px`
        };
        arrowPosition = 'top';
        // 화살표는 버튼 중심을 가리킴 (오른쪽에 있으면 추가로 이동)
        arrowLeft = `${targetCenterX - messageLeft + (isRightSide ? 15 : 0)}px`;
        break;
      case 'center':
      default:
        style = {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
        arrowPosition = null;
        arrowLeft = null;
        break;
    }

    console.log('말풍선 위치 계산:', {
      position: currentTutorial.position,
      style: JSON.stringify(style),
      arrowPosition,
      arrowLeft
    });

    return { style, arrow: arrowPosition, arrowLeft, messageLeft };
  };

  if (!isVisible || !currentTutorial) return null;

  const { style: messageStyle, arrow: arrowPosition, arrowLeft } = getMessageStyle();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 9999,
          pointerEvents: 'none'
        }}
      >
        {/* 오버레이 배경 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            pointerEvents: 'all',
            cursor: 'pointer'
          }}
          onClick={handleNext}
        />

        {/* 스팟라이트 효과 */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute',
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              borderRadius: '12px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'none',
              zIndex: 10000,
              transition: 'all 0.3s ease'
            }}
          />
        )}

        {/* 메시지 박스 */}
        <motion.div
          initial={{
            opacity: 0,
            ...(currentTutorial.position === 'center' ? { scale: 0.9 } : { y: 20 })
          }}
          animate={{
            opacity: 1,
            ...(currentTutorial.position === 'center' ? { scale: 1 } : { y: 0 })
          }}
          exit={{ opacity: 0 }}
          style={{
            ...messageStyle,
            position: 'absolute',
            maxWidth: '280px',
            pointerEvents: 'all',
            zIndex: 10001
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              position: 'relative',
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              textAlign: 'center'
            }}
          >
            {/* 화살표 */}
            {arrowPosition && (
              <div
                style={{
                  position: 'absolute',
                  width: 0,
                  height: 0,
                  ...(arrowPosition === 'top' && {
                    top: '-8px',
                    left: arrowLeft || '50%',
                    transform: 'translateX(-50%)',
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: '8px solid white'
                  }),
                  ...(arrowPosition === 'bottom' && {
                    bottom: '-8px',
                    left: arrowLeft || '50%',
                    transform: 'translateX(-50%)',
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '8px solid white'
                  })
                }}
              />
            )}

            {/* 메시지 텍스트 */}
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#333',
                marginBottom: '16px',
                whiteSpace: 'pre-line'
              }}
            >
              {currentTutorial.message}
            </p>

            {/* 알아가기 버튼 */}
            <button
              onClick={handleNext}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#333'}
              onMouseLeave={(e) => e.target.style.color = '#666'}
            >
              {isLastStep ? '시작하기' : '알아가기'} →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Tutorial;
